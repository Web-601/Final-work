    // Объект для хранения данных корзины
let cart = {
    items: [
        { id: 1, name: "Новогодние гирлянды", price: 4850, quantity: 1, image: "https://www.ofsi.ru/upload/medialibrary/178/miganie.gif" },
        { id: 2, name: "Ватная Ёлочная игрушка", price: 650, quantity: 2, image: "https://basket-10.wbbasket.ru/vol1467/part146794/146794344/images/big/8.webp" }
    ],
            
    // Добавить товар в корзину
            addItem: function(id, name, price, image) {
                // Проверим, есть ли уже такой товар в корзине
                const existingItem = this.items.find(item => item.id === id);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    this.items.push({ id, name, price, quantity: 1, image });
                }
                
                this.updateCart();
            },
            
            // Удалить товар из корзины
            removeItem: function(id) {
                this.items = this.items.filter(item => item.id !== id);
                this.updateCart();
            },
            
            // Изменить количество товара
            updateQuantity: function(id, newQuantity) {
                if (newQuantity < 1) {
                    this.removeItem(id);
                    return;
                }
                
                const item = this.items.find(item => item.id === id);
                if (item) {
                    item.quantity = newQuantity;
                    this.updateCart();
                }
            },
            
            // Получить общее количество товаров
            getTotalItems: function() {
                return this.items.reduce((total, item) => total + item.quantity, 0);
            },
            
            // Получить общую стоимость
            getTotalPrice: function() {
                return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },
            
            // Обновить отображение корзины
            updateCart: function() {
                // Обновить счетчик в иконке корзины
                const cartCountElement = document.querySelector('.cart-count');
                cartCountElement.textContent = this.getTotalItems();
                
                // Обновить содержимое модального окна корзины
                this.renderCartItems();
                
                // Сохранить корзину в localStorage
                this.saveToLocalStorage();
            },
            
            // Отрисовать товары в корзине
            renderCartItems: function() {
                const cartItemsContainer = document.getElementById('cartItemsContainer');
                const cartTotalsContainer = document.querySelector('.cart-totals');
                
                // Если корзина пуста
                if (this.items.length === 0) {
                    cartItemsContainer.innerHTML = `
                        <div class="cart-empty">
                            <div class="cart-empty-icon">
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <h3>Ваша корзина пуста</h3>
                            <p>Добавьте товары из каталога</p>
                        </div>
                    `;
                    
                    cartTotalsContainer.innerHTML = `
                        <div class="total-row">
                            <span class="total-label">Товары (0 шт.)</span>
                            <span class="total-value">0 ₽</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">Доставка</span>
                            <span class="total-value">0 ₽</span>
                        </div>
                        <div class="total-row cart-total">
                            <span class="total-label">Итого</span>
                            <span class="total-value">0 ₽</span>
                        </div>
                    `;
                    
                    return;
                }
                
                // Отрисовать товары
                let itemsHTML = '';
                let subtotal = 0;
                let totalItems = 0;
                
                this.items.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    subtotal += itemTotal;
                    totalItems += item.quantity;
                    
                    itemsHTML += `
                        <div class="cart-item" data-id="${item.id}">
                            <div class="cart-item-image">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            <div class="cart-item-details">
                                <h3 class="cart-item-title">${item.name}</h3>
                                <p class="cart-item-price">${item.price.toLocaleString()} ₽</p>
                                <div class="cart-item-actions">
                                    <div class="quantity-control">
                                        <button class="quantity-btn decrease-qty">-</button>
                                        <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                                        <button class="quantity-btn increase-qty">+</button>
                                    </div>
                                    <button class="remove-item">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                cartItemsContainer.innerHTML = itemsHTML;
                
                // Рассчитать доставку (условно 500 рублей, если сумма меньше 5000)
                const delivery = subtotal < 5000 ? 500 : 0;
                const total = subtotal + delivery;
                
                // Обновить итоговую информацию
                cartTotalsContainer.innerHTML = `
                    <div class="total-row">
                        <span class="total-label">Товары (${totalItems} шт.)</span>
                        <span class="total-value">${subtotal.toLocaleString()} ₽</span>
                    </div>
                    <div class="total-row">
                        <span class="total-label">Доставка</span>
                        <span class="total-value">${delivery.toLocaleString()} ₽</span>
                    </div>
                    <div class="total-row cart-total">
                        <span class="total-label">Итого</span>
                        <span class="total-value">${total.toLocaleString()} ₽</span>
                    </div>
                `;
                
                // Добавить обработчики событий для новых элементов
                this.attachCartItemListeners();
            },
            
            // Привязать обработчики событий к элементам корзины
            attachCartItemListeners: function() {
                // Кнопки увеличения количества
                document.querySelectorAll('.increase-qty').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const cartItem = e.target.closest('.cart-item');
                        const id = parseInt(cartItem.dataset.id);
                        const item = this.items.find(item => item.id === id);
                        this.updateQuantity(id, item.quantity + 1);
                    });
                });
                
                // Кнопки уменьшения количества
                document.querySelectorAll('.decrease-qty').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const cartItem = e.target.closest('.cart-item');
                        const id = parseInt(cartItem.dataset.id);
                        const item = this.items.find(item => item.id === id);
                        this.updateQuantity(id, item.quantity - 1);
                    });
                });
                
                // Кнопки удаления товара
                document.querySelectorAll('.remove-item').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const cartItem = e.target.closest('.cart-item');
                        const id = parseInt(cartItem.dataset.id);
                        this.removeItem(id);
                    });
                });
            },
            
            // Сохранить корзину в localStorage
            saveToLocalStorage: function() {
                localStorage.setItem('autopartsCart', JSON.stringify(this.items));
            },
            
            // Загрузить корзину из localStorage
            loadFromLocalStorage: function() {
                const savedCart = localStorage.getItem('autopartsCart');
                if (savedCart) {
                    this.items = JSON.parse(savedCart);
                    this.updateCart();
                }
            }
        };
        
        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            // Загрузить корзину из localStorage
            cart.loadFromLocalStorage();
            
            // Обработчики для кнопок добавления в корзину
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    const name = this.dataset.name;
                    const price = parseInt(this.dataset.price);
                    const image = this.dataset.image;
                    
                    cart.addItem(id, name, price, image);
                    
                    // Анимация добавления в корзину
                    this.textContent = 'Добавлено!';
                    this.style.backgroundColor = '#28a745';
                    
                    setTimeout(() => {
                        this.textContent = 'В корзину';
                        this.style.backgroundColor = '';
                    }, 1500);
                });
            });
            
            // Открытие модального окна корзины
            const cartIcon = document.getElementById('cartIcon');
            const cartModal = document.getElementById('cartModal');
            const closeCart = document.getElementById('closeCart');
            const continueShopping = document.getElementById('continueShopping');
            
            cartIcon.addEventListener('click', () => {
                cartModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
            
            // Закрытие модального окна корзины
            function closeCartModal() {
                cartModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            closeCart.addEventListener('click', closeCartModal);
            continueShopping.addEventListener('click', closeCartModal);
            
            // Закрытие при клике на фон
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    closeCartModal();
                }
            });
            
            // Плавная прокрутка к якорям
            document.querySelectorAll('nav a').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if(targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if(targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            });
            
            // Обработка формы подписки в футере
            const subscribeForm = document.querySelector('.footer-column .search-box');
            const subscribeInput = subscribeForm.querySelector('input');
            const subscribeButton = subscribeForm.querySelector('button');
            
            subscribeButton.addEventListener('click', function(e) {
                e.preventDefault();
                if (subscribeInput.value) {
                    alert(`Спасибо за подписку! На адрес ${subscribeInput.value} будут приходить наши новости.`);
                    subscribeInput.value = '';
                }
            });
        });
