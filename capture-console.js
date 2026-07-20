import puppeteer from 'puppeteer';

(async () => {
    const url = process.argv[2] || 'http://localhost:3000/admin/profile';
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    // Configura captura de console e erro de requisição
    page.on('console', (msg) => {
        const type = msg.type();
        if (['error', 'warning', 'warn'].includes(type)) {
            console.log(`[CONSOLE ${type.toUpperCase()}] ${msg.text()}`);
        }
    });

    page.on('pageerror', (err) => {
        console.log(`[PAGE ERROR] ${err.toString()}`);
    });

    page.on('requestfailed', (request) => {
        console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
    });

    page.on('response', (response) => {
        if (!response.ok()) {
            console.log(`[RESPONSE FAILED] ${response.url()} - Status: ${response.status()}`);
        }
    });

    try {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Se a rota redirecionou para o login, precisa autenticar
        const currentUrl = page.url();
        if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
            console.log(`[AUTH REQUIRED] Redirecionado para: ${currentUrl}. Precisa logar primeiro.`);
            // Simula o login (ajustar conforme os IDs/names do formulário)
            // Aguarda o form de login e preenche (exemplo genérico)
            try {
                // Adjust if necessary based on the project's login page
                await page.waitForSelector('input[name="email"]');
                await page.type('input[name="email"]', 'admin@example.com');
                await page.type('input[name="password"]', 'password123');
                
                // Clicar no botão que contém o texto "Fazer Login"
                const [button] = await page.$x("//button[contains(., 'Fazer Login')]");
                if (button) {
                    await button.click();
                } else {
                    await page.click('button[type="submit"]');
                }
                
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                
                // Navega de volta para a rota testada
                console.log(`[AUTH SUCCESS] Navegando de volta para ${url}...`);
                await page.goto(url, { waitUntil: 'networkidle0' });
            } catch (loginError) {
                console.log('[AUTH ERROR] Não foi possível logar: ', loginError.message);
            }
        }
        
        // Wait a little bit for client-side rendering
        await new Promise(r => setTimeout(r, 2000));
        
        console.log(`[DONE] Finished checking ${url}`);
    } catch (e) {
        console.log(`[NAVIGATION ERROR] ${e.message}`);
    } finally {
        await browser.close();
    }
})();
