import argparse
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
import shutil
from tempfile import TemporaryDirectory
from threading import Thread

from playwright.sync_api import sync_playwright

from build import write_smoke_images
from web.serve import Handler


BOOT = """async () => {
    if (!crossOriginIsolated) throw Error('The smoke page needs cross-origin isolation');
    const names = ['nor.bin', 'nand-id.bin', 'rom.bin'];
    const images = await Promise.all(names.map(async name => {
        const response = await fetch(name);
        if (!response.ok) throw Error(`Loading ${name} failed: ${response.status}`);
        return new Uint8Array(await response.arrayBuffer());
    }));
    const script = new URL('qemu-system-arm.js', location.href).href;
    const {default: createQemu} = await import(script);
    window.smokeRuntime = await createQemu({
        mainScriptUrlOrBlob: script,
        print: console.log,
        printErr: console.error,
        onAbort: reason => { window.smokeError = `QEMU aborted: ${reason}`; },
        onExit: code => { window.smokeError = `QEMU exited: ${code}`; },
        arguments: ['-M', 'ats3089c-wp2', '-bios', '/watch/rom.bin',
            '-display', 'none', '-monitor', 'none', '-serial', 'file:/watch/uart.log',
            '-serial', 'null', '-serial', 'null', '-icount', 'shift=3,align=off', '-no-reboot'],
        preRun: [module => {
            module.FS.mkdir('/watch');
            names.forEach((name, index) => module.FS.writeFile(`/watch/${name}`, images[index]));
            module.ENV.QEMU_WP2_NOR = '/watch/nor.bin';
        }],
    });
}"""


def check_browser(url, channel):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel=channel)
        try:
            page = browser.new_page()
            page_errors = []
            page.on("console", lambda message: print(message.text, flush=True))
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            page.goto(url)
            page.evaluate(f"() => {{ ({BOOT})().catch(error => {{ window.smokeError = String(error); }}); }}")
            page.wait_for_function("""() => {
                if (window.smokeError) throw Error(window.smokeError);
                if (!window.smokeRuntime) return false;
                const path = '/watch/uart.log';
                const {FS} = window.smokeRuntime;
                return FS.analyzePath(path).exists && FS.readFile(path, {encoding: 'utf8'}) === '*';
            }""", timeout=15000)
            if page_errors:
                raise RuntimeError("Browser page errors: " + "\n".join(page_errors))
        finally:
            browser.close()


def main():
    parser = argparse.ArgumentParser(description="Boot the synthetic QEMU guest in a real browser")
    parser.add_argument("runtime", type=Path, help="WASM build artifact directory")
    parser.add_argument("--channel", default="chrome", help="Installed Chromium channel (chrome or msedge)")
    args = parser.parse_args()
    with TemporaryDirectory(dir=args.runtime.resolve().parent) as scratch:
        directory = Path(scratch)
        write_smoke_images(directory)
        (directory / "index.html").write_text(
            '<!doctype html><title>QEMU boot smoke test</title><link rel="icon" href="data:,">',
            encoding="utf-8",
        )
        shutil.copyfile(args.runtime / "qemu-system-arm", directory / "qemu-system-arm.js")
        for name in ("qemu-system-arm.wasm", "qemu-system-arm.worker.js"):
            shutil.copyfile(args.runtime / name, directory / name)
        with ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=directory)) as server:
            thread = Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                check_browser(f"http://127.0.0.1:{server.server_port}/", args.channel)
            finally:
                server.shutdown()
                thread.join()
    print("Browser WASM synthetic boot passed")


if __name__ == "__main__":
    main()
