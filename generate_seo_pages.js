const fs = require('fs');
const path = require('path');

const locations = [
    'Sartell',
    'Sauk Rapids',
    'Waite Park',
    'St. Joseph',
    'Foley',
    'Clearwater',
    'Becker',
    'Monticello',
    'Rogers',
    'Albertville',
    'Holdingford',
    'St. Michael'
];

const services = [
    { baseFile: 'index.html', filename: 'index.html' },
    { baseFile: 'deep-cleaning.html', filename: 'deep-cleaning.html' },
    { baseFile: 'standard-cleaning.html', filename: 'standard-cleaning.html' },
    { baseFile: 'move-in-out.html', filename: 'move-in-out.html' },
    { baseFile: 'post-construction.html', filename: 'post-construction.html' }
];

const generatedUrls = [
    'https://cookcleaningllc.com/',
    'https://cookcleaningllc.com/deep-cleaning.html',
    'https://cookcleaningllc.com/standard-cleaning.html',
    'https://cookcleaningllc.com/move-in-out.html',
    'https://cookcleaningllc.com/post-construction.html',
    'https://cookcleaningllc.com/privacy.html',
    'https://cookcleaningllc.com/terms.html'
];

function toSlug(text) {
    return text.toLowerCase().replace(/[\s\.]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

console.log('Starting Programmatic SEO Reorganization...');

// 1. Cleanup old flat files
console.log('Cleaning up old flat files...');
locations.forEach(city => {
    const citySlug = toSlug(city);
    const oldFiles = [
        `${citySlug}.html`,
        `deep-cleaning-${citySlug}.html`,
        `standard-cleaning-${citySlug}.html`,
        `move-in-out-${citySlug}.html`,
        `post-construction-${citySlug}.html`
    ];
    oldFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted: ${file}`);
        }
    });
});

// 2. Generate new folder structures
locations.forEach(city => {
    const citySlug = toSlug(city);
    const dirPath = path.join(__dirname, citySlug);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath);
    }
    
    services.forEach(service => {
        const baseFilePath = path.join(__dirname, service.baseFile);
        let content = fs.readFileSync(baseFilePath, 'utf8');
        
        // Target filename and URL
        const targetFilename = service.filename;
        const targetPath = path.join(dirPath, targetFilename);
        const targetUrl = `https://cookcleaningllc.com/${citySlug}/${targetFilename === 'index.html' ? '' : targetFilename}`;
        
        // 1. Replace City Names (Exact matches)
        content = content.replace(/Saint Cloud/g, city);
        content = content.replace(/St\. Cloud/g, city);
        
        // 2. Fix Canonical Links
        if (service.baseFile === 'index.html') {
            content = content.replace(/href="https:\/\/cookcleaningllc\.com\/"/, `href="${targetUrl}"`);
        } else {
            content = content.replace(new RegExp(`href="https:\\/\\/cookcleaningllc\\.com\\/${service.baseFile}"`), `href="${targetUrl}"`);
        }
        
        // 3. Update internal links (CSS, JS, Images, etc.) to use relative path '../'
        // CSS
        content = content.replace(/href="style\.css"/g, 'href="../style.css"');
        content = content.replace(/href="assets\//g, 'href="../assets/');
        // Images
        content = content.replace(/src="assets\//g, 'src="../assets/');
        // JS
        content = content.replace(/src="script\.js"/g, 'src="../script.js"');
        // Root Pages (Privacy, Terms, Home)
        content = content.replace(/href="privacy\.html"/g, 'href="../privacy.html"');
        content = content.replace(/href="terms\.html"/g, 'href="../terms.html"');
        
        // 4. Update Internal Service Links to point to city-specific services IN THE SAME FOLDER
        // Since we are in the same folder, href="deep-cleaning.html" remains correct!
        // But wait, the original index.html has href="deep-cleaning.html".
        // The only thing we need to fix is the Logo link (href="#") -> href="index.html"
        
        // Actually, the original files ALREADY use `href="deep-cleaning.html"`, so inside the `/sartell/` folder, clicking `deep-cleaning.html` correctly goes to `/sartell/deep-cleaning.html`!
        // That is the beauty of this structure. It requires NO change to the service links!
        
        // Save the file
        fs.writeFileSync(targetPath, content);
        console.log(`Generated: ${citySlug}/${targetFilename}`);
        generatedUrls.push(targetUrl);
    });
});

// 3. Generate Sitemap
console.log('Generating sitemap.xml...');
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

const dateStr = new Date().toISOString().split('T')[0];

generatedUrls.forEach(url => {
    let priority = '0.8';
    if (url === 'https://cookcleaningllc.com/') priority = '1.0';
    if (url.includes('privacy') || url.includes('terms')) priority = '0.3';
    
    sitemapContent += `  <url>\n`;
    sitemapContent += `    <loc>${url}</loc>\n`;
    sitemapContent += `    <lastmod>${dateStr}</lastmod>\n`;
    sitemapContent += `    <priority>${priority}</priority>\n`;
    sitemapContent += `  </url>\n`;
});

sitemapContent += `</urlset>\n`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapContent);
console.log('Successfully generated sitemap.xml with ' + generatedUrls.length + ' URLs.');
console.log('Programmatic SEO reorganization complete!');
