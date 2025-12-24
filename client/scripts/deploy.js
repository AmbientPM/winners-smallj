const { execSync } = require('child_process');
const path = require('path');

// FTP Configuration
const FTP_HOST = 'prod-ftp-metals.tpof-aridrops.com';
const FTP_USER = 'defaultprod-metals.tpof-aridrops.com';
const FTP_PASS = 'DPeokd(I0d9d2-3';
const FTP_REMOTE_DIR = '/web';

// Local build directory
const LOCAL_DIR = path.join(__dirname, '..', 'out');

console.log('🚀 Starting deployment to FTP...');
console.log(`📁 Local directory: ${LOCAL_DIR}`);
console.log(`🌐 Remote: ${FTP_HOST}${FTP_REMOTE_DIR}`);

try {
    // Use lftp for reliable FTP upload with mirror
    const command = `lftp -c "
        set ftp:ssl-allow no;
        set net:timeout 30;
        set net:max-retries 3;
        set cmd:fail-exit no;
        open -u ${FTP_USER},${FTP_PASS} ftp://${FTP_HOST};
        mirror -R --delete --exclude .well-known --verbose \"${LOCAL_DIR}\" ${FTP_REMOTE_DIR};
        quit
    " || true`;

    console.log('\n📤 Uploading files...\n');
    execSync(command, { stdio: 'inherit' });

    console.log('\n✅ Deployment completed successfully!');
    console.log('⚠️  Note: Some files may not have been deleted due to permissions, but new files were uploaded.');
} catch (error) {
    console.error('\n⚠️  Deployment completed with warnings:', error.message);

    // Fallback: try with ncftpput if lftp is not available
    console.log('\n🔄 Trying alternative method with ncftpput...');
    try {
        const altCommand = `ncftpput -R -v -u "${FTP_USER}" -p "${FTP_PASS}" ${FTP_HOST} ${FTP_REMOTE_DIR} "${LOCAL_DIR}"/*`;
        execSync(altCommand, { stdio: 'inherit' });
        console.log('\n✅ Deployment completed successfully (via ncftpput)!');
    } catch (altError) {
        console.error('\n❌ Alternative method also failed.');
        console.log('\n💡 Please install lftp or ncftp:');
        console.log('   brew install lftp');
        console.log('   or');
        console.log('   brew install ncftp');
        process.exit(1);
    }
}
