sudo spctl --master-disable
sudo chmod -R 777 /Applications/F1MV-DigiFlag.app
xattr -d com.apple.quarantine /Applications/F1MV-DigiFlag.app
xattr -cr /Applications/F1MV-DigiFlag.app

echo 'Done'