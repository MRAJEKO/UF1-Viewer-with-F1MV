echo 'Removing old builds'
rm -rf F1MV-DigiFlag-*
echo 'Old builds removed'
echo 'Building .ts file...'
tsc
echo 'Building .ts file done'
echo 'Starting building...'
echo 'Building Win32x64'
electron-packager ./ F1MV-DigiFlag --platform=win32 --arch=x64 --icon=icon.icns
echo 'Building Win32x64 completed'
echo 'Building Darwin'
electron-packager ./ F1MV-DigiFlag --platform=darwin --icon=icon.icns --arch=arm64
electron-packager ./ F1MV-DigiFlag --platform=darwin --icon=icon.icns --arch=x64
echo 'Building Darwin completed'
echo 'Building Linux'
electron-packager ./ F1MV-DigiFlag --platform=linux --icon=icon.icns --arch=arm64
electron-packager ./ F1MV-DigiFlag --platform=linux --icon=icon.icns --arch=x64
echo 'Building Linux completed'
echo 'Removing useless files...'
rm -rf ./F1MV-DigiFlag-darwin-*/LICENSE*
rm -rf ./F1MV-DigiFlag-darwin-*/version
echo 'Useless files removed'
echo 'Zipping files...'
zip F1MV-DigiFlag-linux-arm64.zip ./F1MV-DigiFlag-linux-arm64/* -r
zip F1MV-DigiFlag-linux-x64.zip ./F1MV-DigiFlag-linux-x64/* -r
zip F1MV-DigiFlag-win32-x64.zip ./F1MV-DigiFlag-win32-x64/* -r
echo 'Zippied files done'
echo 'Create Applications folder alias'
ln -s /Applications ./F1MV-DigiFlag-darwin-arm64/Applications
ln -s /Applications ./F1MV-DigiFlag-darwin-x64/Applications
echo 'Create Applications folder alias done'
echo 'Create the .dmg file'
hdiutil create -srcfolder ./F1MV-DigiFlag-darwin-arm64 ./F1MV-DigiFlag-darwin-arm64.dmg
hdiutil create -srcfolder ./F1MV-DigiFlag-darwin-x64 ./F1MV-DigiFlag-darwin-x64.dmg
echo '.dmg file created'
echo 'Building completed'