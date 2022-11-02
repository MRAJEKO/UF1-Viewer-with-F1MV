echo 'Building...'
rm -rf F1MV-DigiFlag-*
tsc
echo 'Done.'
echo 'Starting electron...'
electron .
echo 'Electron closed'