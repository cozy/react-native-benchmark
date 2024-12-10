import {
    copyFileAssets,
    unlink,
  } from '@dr.pogodin/react-native-fs';
  import { resolveAssetsPath } from '@dr.pogodin/react-native-static-server';

  export const prepareAssets = async () => {
    console.log('Preparing assets...');

    const targetWebrootPathOnDevice = resolveAssetsPath('webroot');

    try {
      await unlink(targetWebrootPathOnDevice);
    } catch (e) {
      console.log(e);
    }

    try {
      await copyFileAssets('webroot', targetWebrootPathOnDevice);
    } catch (e) {
      console.log(e);
    }

    console.log('Assets ready ✅');
  };
