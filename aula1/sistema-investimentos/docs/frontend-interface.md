# Frontend - Interface do Usuário

## Visão Geral

O frontend do **Sistema de Investimentos** é uma aplicação web moderna e responsiva que oferece uma experiência de usuário intuitiva para gerenciamento de investimentos. Desenvolvido com tecnologias web padrão e integrado ao backend monolítico, proporciona uma interface visual rica para todas as funcionalidades do sistema.

## Arquitetura Frontend

### Tecnologias Principais

- **Template Engine**: EJS (Embedded JavaScript Templates)
- **CSS Framework**: Bootstrap 5.3
- **JavaScript**: ES6+ Vanilla JavaScript
- **Charting**: Chart.js para visualizações
- **Icons**: Font Awesome para iconografia
- **Responsive**: Mobile-first design

### Estrutura de Arquivos

```
src/views/                   # Templates EJS
├── layout/
│   └── base.ejs           # Layout principal
├── pages/
│   ├── home.ejs           # Página inicial
│   ├── login.ejs          # Login
│   ├── register.ejs       # Cadastro
│   ├── dashboard.ejs      # Dashboard
│   ├── assets.ejs         # Catálogo de ativos
│   ├── portfolio.ejs      # Análise de portfólio
│   ├── transactions.ejs   # Transações
│   └── profile.ejs        # Perfil do usuário
└── error.ejs              # Página de erro

src/public/                  # Assets estáticos
├── css/
│   └── app.css            # CSS personalizado
├── js/
│   └── app.js             # JavaScript principal
└── images/                # Imagens e ícones
```

## Design System

### Cores e Tema

```css
/* Paleta de Cores Principal */
--primary-color: #007bff;       /* Azul principal */
--secondary-color: #6c757d;     /* Cinza secundário */
--success-color: #28a745;       /* Verde sucesso */
--danger-color: #dc3545;        /* Vermelho erro */
--warning-color: #ffc107;       /* Amarelo aviso */
--info-color: #17a2b8;          /* Azul informativo */
--light-color: #f8f9fa;         /* Cinza claro */
--dark-color: #343a40;          /* Cinza escuro */
```

### Tipografia

- **Fonte Principal**: System fonts stack
- **Headings**: Pesos 300-700
- **Body**: Weight 400
- **Links**: Hover effects e estados ativos

### Grid System

- **Container**: Bootstrap responsive containers
- **Columns**: Sistema de 12 colunas
- **Breakpoints**: xs, sm, md, lg, xl, xxl
- **Gutters**: Espaçamento consistente

## Componentes Principais

### 1. Layout Base (`base.ejs`)

Layout principal compartilhado por todas as páginas.

#### Estrutura HTML

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %> | Sistema de Investimentos</title>
    <!-- Bootstrap CSS -->
    <!-- Font Awesome -->
    <!-- Custom CSS -->
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <!-- Brand, menu items, user controls -->
    </nav>
    
    <!-- Main Content -->
    <main class="container-fluid py-4">
        <%- body %>
    </main>
    
    <!-- Footer -->
    <footer class="bg-light py-4 mt-5">
        <!-- Footer content -->
    </footer>
    
    <!-- Scripts -->
    <!-- Bootstrap JS -->
    <!-- Chart.js -->
    <!-- Custom JS -->
</body>
</html>
```

#### Navbar Dinâmica

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
        <a class="navbar-brand" href="/">
            Sistema de Investimentos
        </a>
        
        <!-- Mobile toggle -->
        <button class="navbar-toggler" type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <!-- Navigation items -->
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
                <!-- Public links -->
                <li class="nav-item">
                    <a class="nav-link" href="/">Home</a>
                </li>
                
                <!-- Authenticated user links -->
                <li class="nav-item auth-only d-none">
                    <a class="nav-link" href="/dashboard">Dashboard</a>
                </li>
                <li class="nav-item auth-only d-none">
                    <a class="nav-link" href="/assets">Ativos</a>
                </li>
                <li class="nav-item auth-only d-none">
                    <a class="nav-link" href="/portfolio">Portfólio</a>
                </li>
                <li class="nav-item auth-only d-none">
                    <a class="nav-link" href="/transactions">Transações</a>
                </li>
            </ul>
            
            <!-- User menu -->
            <ul class="navbar-nav">
                <!-- Guest user -->
                <li class="nav-item guest-only">
                    <a class="nav-link" href="/login">Login</a>
                </li>
                <li class="nav-item guest-only">
                    <a class="nav-link" href="/register">Cadastrar</a>
                </li>
                
                <!-- Authenticated user -->
                <li class="nav-item dropdown auth-only d-none">
                    <a class="nav-link dropdown-toggle" href="#" 
                       id="navbarDropdown" role="button" 
                       data-bs-toggle="dropdown">
                        <span id="nav-username">Usuário</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="/profile">Perfil</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="app.logout()">Logout</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>
```

### 2. JavaScript Principal (`app.js`)

Gerenciamento centralizado da aplicação frontend.

#### Classe InvestmentApp

```javascript
class InvestmentApp {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.notifications = new NotificationManager();
        this.init();
    }
    
    // Inicialização da aplicação
    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.updateUI();
    }
    
    // Configuração de event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }
        
        // Profile forms
        this.setupProfileEventListeners();
        
        // Investment modals
        this.setupInvestmentEventListeners();
    }
    
    // Verificação de autenticação
    async checkAuth() {
        if (!this.token) {
            this.updateAuthUI(false);
            return false;
        }
        
        try {
            const response = await this.apiCall('/api/v1/auth/verify', 'GET');
            if (response.success) {
                this.user = response.data;
                localStorage.setItem('user', JSON.stringify(this.user));
                this.updateAuthUI(true);
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.logout();
            return false;
        }
    }
    
    // Atualização da interface baseada na autenticação
    updateAuthUI(isAuthenticated) {
        const authElements = document.querySelectorAll('.auth-only');
        const guestElements = document.querySelectorAll('.guest-only');
        
        if (isAuthenticated) {
            authElements.forEach(el => el.classList.remove('d-none'));
            guestElements.forEach(el => el.classList.add('d-none'));
            
            // Update username
            const usernameEl = document.getElementById('nav-username');
            if (usernameEl && this.user) {
                usernameEl.textContent = this.user.name || this.user.email;
            }
        } else {
            authElements.forEach(el => el.classList.add('d-none'));
            guestElements.forEach(el => el.classList.remove('d-none'));
        }
    }
    
    // Login handler
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        try {
            const response = await this.apiCall('/api/v1/auth/login', 'POST', {
                email: formData.get('email'),
                password: formData.get('password')
            });
            
            if (response.success) {
                this.token = response.data.token;
                this.user = response.data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                this.notifications.showSuccess('Login realizado com sucesso!');
                this.updateAuthUI(true);
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                this.notifications.showError(response.message || 'Erro no login');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.notifications.showError('Erro interno do servidor');
        }
    }
    
    // Logout
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        this.updateAuthUI(false);
        this.notifications.showInfo('Logout realizado com sucesso');
        
        // Redirect to home
        if (window.location.pathname !== '/') {
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    }
    
    // API call utility
    async apiCall(url, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (this.token) {
            options.headers.Authorization = `Bearer ${this.token}`;
        }
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        
        if (response.status === 401) {
            this.logout();
            throw new Error('Unauthorized');
        }
        
        return await response.json();
    }
}

// Notification Manager
class NotificationManager {
    constructor() {
        this.container = this.createContainer();
        document.body.appendChild(this.container);
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        return container;
    }
    
    showNotification(message, type = 'info', duration = 5000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        
        // Show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, duration + 500);
    }
    
    createToast(message, type) {
        const colors = {
            success: 'text-bg-success',
            error: 'text-bg-danger',
            warning: 'text-bg-warning',
            info: 'text-bg-info'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${colors[type] || colors.info}`;
        toast.setAttribute('role', 'alert');
        
        toast.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">Sistema de Investimentos</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        
        return toast;
    }
    
    showSuccess(message) { this.showNotification(message, 'success'); }
    showError(message) { this.showNotification(message, 'error'); }
    showWarning(message) { this.showNotification(message, 'warning'); }
    showInfo(message) { this.showNotification(message, 'info'); }
}

// Utility functions
const utils = {
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },
    
    formatPercent(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value / 100);
    },
    
    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    },
    
    formatDateTime(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }
};

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new InvestmentApp();
});
```

### 3. CSS Personalizado (`app.css`)

Estilos customizados para complementar o Bootstrap.

```css
/* Variables CSS */
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
    --light-color: #f8f9fa;
    --dark-color: #343a40;
    --border-radius: 0.375rem;
    --box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

/* Global Styles */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: var(--dark-color);
}

/* Navbar Customizations */
.navbar-brand {
    font-weight: 600;
    font-size: 1.25rem;
}

.navbar-nav .nav-link {
    font-weight: 500;
    transition: all 0.3s ease;
}

.navbar-nav .nav-link:hover {
    color: rgba(255, 255, 255, 0.9) !important;
}

/* Card Enhancements */
.card {
    border: none;
    box-shadow: var(--box-shadow);
    transition: all 0.3s ease;
}

.card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.card-header {
    background-color: var(--light-color);
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    font-weight: 600;
}

/* Button Customizations */
.btn {
    font-weight: 500;
    border-radius: var(--border-radius);
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

/* Form Enhancements */
.form-control, .form-select {
    border-radius: var(--border-radius);
    border: 1px solid #dee2e6;
    transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Table Styles */
.table {
    margin-bottom: 0;
}

.table th {
    border-top: none;
    font-weight: 600;
    color: var(--dark-color);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.table-hover tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.025);
}

/* Widget Styles */
.widget {
    background: linear-gradient(135deg, var(--primary-color), #0056b3);
    color: white;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
}

.widget::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30px, -30px);
}

.widget-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.widget-label {
    font-size: 0.875rem;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Chart Container */
.chart-container {
    position: relative;
    height: 300px;
    margin: 1rem 0;
}

/* Loading States */
.loading {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid #f3f3f3;
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Skeleton Loading */
.skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Responsive Utilities */
@media (max-width: 768px) {
    .navbar-brand {
        font-size: 1.1rem;
    }
    
    .widget {
        text-align: center;
        margin-bottom: 1rem;
    }
    
    .widget-value {
        font-size: 1.5rem;
    }
    
    .table-responsive {
        font-size: 0.875rem;
    }
}

/* Toast Customizations */
.toast-container {
    z-index: 9999;
}

.toast {
    border: none;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

/* Footer */
footer {
    margin-top: auto;
    background-color: var(--light-color) !important;
    border-top: 1px solid #dee2e6;
}

/* Status Indicators */
.status-positive {
    color: var(--success-color);
    font-weight: 600;
}

.status-negative {
    color: var(--danger-color);
    font-weight: 600;
}

.status-neutral {
    color: var(--secondary-color);
    font-weight: 600;
}

/* Modal Customizations */
.modal-header {
    background-color: var(--light-color);
    border-bottom: 1px solid #dee2e6;
}

.modal-footer {
    background-color: var(--light-color);
    border-top: 1px solid #dee2e6;
}

/* Animation Classes */
.fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.slide-up {
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
```

## Conclusão

O frontend do Sistema de Investimentos demonstra a implementação de uma interface moderna e responsiva usando tecnologias web padrão. A integração com o backend monolítico permite um desenvolvimento simplificado enquanto mantém uma experiência de usuário rica e interativa.

### Principais Características:

- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Componentes Reutilizáveis**: Arquitetura modular e escalável
- **Interatividade**: JavaScript moderno com ES6+ e API integration
- **UX/UI Moderna**: Bootstrap 5 com customizações próprias
- **Performance**: Carregamento otimizado e experiência fluida

### Próximos Passos:

- **PWA**: Implementar service workers para funcionamento offline
- **Acessibilidade**: Melhorar suporte para leitores de tela
- **Testes**: Implementar testes automatizados para componentes
- **Otimização**: Minificação e compressão de assets