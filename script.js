document.addEventListener('DOMContentLoaded', () => {
    // برای سادگی و نمایش مفهوم، داده‌ها را در localStorage ذخیره می‌کنیم.
    // در یک پروژه واقعی، این داده‌ها باید در یک بک‌اند و پایگاه داده امن ذخیره شوند.
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let configs = JSON.parse(localStorage.getItem('configs')) || [];

    const ADMIN_PASSWORD = "1388"; // رمز عبور ادمین

    const adminLoginForm = document.getElementById('admin-login-form');
    const userLoginForm = document.getElementById('user-login-form');
    const userRegisterForm = document.getElementById('user-register-form');
    const addConfigForm = document.getElementById('add-config-form');
    const adminConfigList = document.getElementById('admin-config-list');
    const userConfigList = document.getElementById('user-config-list');
    const welcomeUsername = document.getElementById('welcome-username');
    const logoutButtons = document.querySelectorAll('#logout-button');

    // --- توابع کمکی ---
    function saveUsers() {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function saveConfigs() {
        localStorage.setItem('configs', JSON.stringify(configs));
    }

    function displayMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = type === 'success' ? 'success-message' : 'error-message';
            setTimeout(() => {
                element.textContent = '';
                element.className = '';
            }, 5000);
        }
    }

    function renderConfigs(targetListElement, showCopyButton = false) {
        if (!targetListElement) return; // اطمینان از وجود عنصر
        targetListElement.innerHTML = '';
        if (configs.length === 0) {
            targetListElement.innerHTML = '<li>کانفیگی یافت نشد.</li>';
            return;
        }
        configs.forEach(config => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${config.name}:</strong>
                <span>${config.link_or_config_data}</span>
                ${showCopyButton ? '<button class="copy-button" data-config="' + config.link_or_config_data + '">کپی</button>' : ''}
            `;
            targetListElement.appendChild(li);
        });

        // افزودن شنونده رویداد برای دکمه‌های کپی
        if (showCopyButton) {
            document.querySelectorAll('.copy-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const configToCopy = event.target.dataset.config;
                    navigator.clipboard.writeText(configToCopy).then(() => {
                        alert('کانفیگ کپی شد!');
                    }).catch(err => {
                        console.error('خطا در کپی کردن: ', err);
                    });
                });
            });
        }
    }

    function handleLogout() {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('isAdmin');
        window.location.href = 'index.html'; // برگشت به صفحه ورود
    }

    // --- مدیریت رویدادها ---

    // فرم ورود ادمین
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('admin-password').value;
            if (password === ADMIN_PASSWORD) {
                localStorage.setItem('loggedInUser', 'admin');
                localStorage.setItem('isAdmin', 'true');
                window.location.href = 'admin.html';
            } else {
                displayMessage('admin-login-message', 'رمز عبور ادمین اشتباه است.', 'error');
            }
        });
    }

    // فرم ورود کاربر
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('user-username-login').value;
            const password = document.getElementById('user-password-login').value;
            const user = users.find(u => u.username === username && u.password === password); // در حالت واقعی از هش پسورد استفاده کنید
            if (user) {
                localStorage.setItem('loggedInUser', username);
                localStorage.removeItem('isAdmin'); // اطمینان حاصل کنید که ادمین نیست
                window.location.href = 'user.html';
            } else {
                displayMessage('user-login-message', 'نام کاربری یا رمز عبور اشتباه است.', 'error');
            }
        });
    }

    // فرم ثبت‌نام کاربر
    if (userRegisterForm) {
        userRegisterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('user-username-register').value;
            const password = document.getElementById('user-password-register').value;

            if (users.some(u => u.username === username)) {
                displayMessage('user-register-message', 'این نام کاربری قبلاً ثبت شده است.', 'error');
                return;
            }

            users.push({ username, password }); // در حالت واقعی پسورد باید هش شود
            saveUsers();
            displayMessage('user-register-message', 'ثبت‌نام با موفقیت انجام شد! حالا می‌توانید وارد شوید.', 'success');
            userRegisterForm.reset();
        });
    }

    // مدیریت پنل ادمین
    if (window.location.pathname.endsWith('admin.html')) {
        if (localStorage.getItem('loggedInUser') !== 'admin' || localStorage.getItem('isAdmin') !== 'true') {
            window.location.href = 'index.html'; // اگر ادمین نیست، به صفحه ورود برگردان
        }
        renderConfigs(adminConfigList, false); // نمایش کانفیگ‌ها در پنل ادمین بدون دکمه کپی

        if (addConfigForm) {
            addConfigForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('config-name').value;
                const link = document.getElementById('config-link').value;
                configs.push({ id: Date.now(), name, link_or_config_data: link });
                saveConfigs();
                displayMessage('add-config-message', 'کانفیگ با موفقیت اضافه شد!', 'success');
                addConfigForm.reset();
                renderConfigs(adminConfigList, false); // رفرش لیست کانفیگ‌ها
            });
        }
    }

    // مدیریت پنل کاربر
    if (window.location.pathname.endsWith('user.html')) {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser || loggedInUser === 'admin') {
            window.location.href = 'index.html'; // اگر کاربر عادی نیست، به صفحه ورود برگردان
        }
        if (welcomeUsername) {
            welcomeUsername.textContent = loggedInUser;
        }
        renderConfigs(userConfigList, true); // نمایش کانفیگ‌ها در پنل کاربر با دکمه کپی
    }

    // مدیریت دکمه‌های خروج
    logoutButtons.forEach(button => {
        button.addEventListener('click', handleLogout);
    });
});
