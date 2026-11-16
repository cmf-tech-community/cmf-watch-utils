# Local firmware files

Use this directory for firmware files you are testing. Run tool commands from
the repository root and supply the path explicitly, for example:

```text
uv run fwkit verify firmware/custom.bin
```

Local firmware files here are ignored by Git. Published reference images live
under [`dumps/binaries/`](../dumps/README.md), with checksums in
[`dumps/manifests/`](../dumps/manifests/). Download instructions are in the
[setup guide](https://cmf.arnv.dev/getting-started/setup/).

Keep an untouched copy before modifying an image. Valid checksums confirm file
integrity, not compatibility or recoverability on a physical watch.
