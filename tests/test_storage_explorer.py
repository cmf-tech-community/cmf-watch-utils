import importlib.util
import json
from pathlib import Path
import unittest


SOURCE = Path(__file__).resolve().parents[1] / 'tools' / 'storage_explorer'
SPEC = importlib.util.spec_from_file_location('storage_reference_exports', SOURCE / 'reference_exports.py')
EXPORTS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(EXPORTS)


class StorageExplorerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = json.loads((SOURCE / 'data.json').read_text(encoding='utf-8'))
        cls.reference = EXPORTS.make_structure(cls.payload)
        cls.nodes = cls.reference['nodes']

    def test_physical_and_logical_capacity_are_separate(self):
        spaces = {space['id']: space['sizeBytes'] for space in self.reference['addressSpaces']}
        self.assertEqual(self.reference['physicalMainCapacityBytes'], spaces['nand-physical'] + spaces['nor-physical'])
        self.assertEqual(spaces['nand-physical'] - spaces['nand-logical'], 5 * 1048576)

    def test_partitions_have_verified_ranges_and_purposes(self):
        partitions = [node for node in self.nodes if 'partitionFileId' in node]
        self.assertEqual(len(partitions), 22)
        for space in ('nand-logical', 'nor-physical'):
            previous_end = 0
            for node in sorted((n for n in partitions if n['addressSpace'] == space), key=lambda n: n['range']['startByte']):
                self.assertEqual(node['range']['startByte'], previous_end)
                self.assertTrue(node['role'])
                previous_end = node['range']['endByteExclusive']
            self.assertEqual(previous_end, 0x07080000 if space == 'nand-logical' else 0x00400000)

    def test_writable_storage_is_not_a_factory_free_space_claim(self):
        node = next(n for n in self.nodes if n['name'] == 'udisk')
        self.assertEqual(node['category'], 'filesystem')
        self.assertEqual(node['partitionFileId'], 40)
        self.assertEqual(node['sizeBytes'], 10 * 1048576)
        self.assertIn('clean-stock free space not measured', node['verification'])
        self.assertFalse(self.reference['scope']['factoryFreeSpaceVerified'])
        self.assertFalse(self.reference['scope']['personalValuesIncluded'])
        self.assertFalse(self.reference['scope']['installedAppsIncluded'])

    def test_animations_are_distinct_from_watch_faces(self):
        animations = [n for n in self.nodes if n['name'].endswith('.ajs')]
        faces = [n for n in self.nodes if n['name'].endswith('.wfc')]
        self.assertEqual(len(animations), 19)
        self.assertEqual(len(faces), 6)
        self.assertTrue(all(n['category'] == 'animations' for n in animations))
        self.assertTrue(all(n['category'] == 'faces' for n in faces))

    def test_capture_checksum_failure_remains_visible(self):
        node = next(n for n in self.nodes if n['name'] == 'res_b')
        self.assertEqual(node['category'], 'resources')
        self.assertIn('body checksum fails', node['verification'])


if __name__ == '__main__':
    unittest.main()
