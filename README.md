# MarketHub — Multi-Vendor Marketplace

MarketHub is a multi-vendor marketplace project built with **HTML, CSS, JavaScript, Python, and MySQL**.

The project provides a customer shopping interface where users can sign up/sign in, view vendors, browse vendor products, search products, manage a shopping cart, and place orders.

## Project Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Browser `localStorage`

### Backend / Database Logic
- Python
- MySQL Connector
- MySQL

The current JavaScript frontend is running in **demo mode**. `API_MODE` is set to `false`, and vendor/product data is currently stored in JavaScript. The JavaScript file contains a placeholder for connecting to JSON API endpoints later. 

## Project Files

```text
MarketHub/
│
├── index.html
├── style.css
├── app.js
└── main.py
```

### `index.html`

Contains the complete frontend structure:

- Sign In screen
- Create Account screen
- Dashboard
- Vendor section
- Product section
- Product search
- Shopping cart
- User profile
- Navigation
- Logout

The page loads `style.css` and `app.js`. 

### `style.css`

Contains the complete UI styling:

- Marketplace layout
- Authentication card
- Navigation bar
- Vendor cards
- Product cards
- Search bar
- Cart layout
- Profile layout
- Buttons
- Toast notifications
- Responsive mobile layout

The CSS includes responsive breakpoints for screens below 900px and 620px. 

### `app.js`

Contains the frontend application logic:

- Authentication UI switching
- User state
- Vendor rendering
- Product rendering
- Product search
- Cart management
- Order simulation
- Profile rendering
- Logout
- `localStorage` persistence

The application currently initializes vendors and products from demo JavaScript arrays. 

### `main.py`

Contains the Python/MySQL business logic:

- MySQL connection
- User signup
- User signin
- Vendor retrieval
- Vendor product retrieval
- Add to cart
- View cart
- Place order
- Order item creation
- Product stock reduction
- Dashboard
- Product search

The Python code connects to the `multivendor_marketing` MySQL database using `mysql.connector`. 

---

# 1. Application Workflow

The overall application flow is:

```text
                    USER
                     │
                     ▼
             HTML / CSS / JS
                     │
                     ▼
              Marketplace UI
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     Vendors      Search        Profile
        │            │
        ▼            ▼
     Products ─────────────┐
        │                  │
        ▼                  │
      Cart ◄───────────────┘
        │
        ▼
   Place Order
        │
        ▼
    Order Items
        │
        ▼
   Reduce Stock
        │
        ▼
      MySQL
```

---

# 2. Authentication Workflow

## Sign Up

The signup form collects:

```text
Name
Phone
Email
Address
Username
Password
```

The HTML form contains these fields in the authentication screen.

The Python `signup()` function is designed to:

1. Receive customer information.
2. Check whether the username already exists.
3. Insert customer information into `customer`.
4. Retrieve the generated customer ID.
5. Insert username/password into `users`.
6. Commit the transaction.

Database relationship:

```text
customer
   │
   │ customer_id
   ▼
 users
```

## Sign In

The sign-in form accepts:

```text
Username
Password
```

The Python `signin()` function queries `users` and joins it with `customer` using:

```text
users.customer_id = customer.c_id
```

The returned user information includes:

```text
user_id
username
customer_id
name
mail
phone
address
```

After successful authentication, the dashboard is opened.

---

# 3. Dashboard Workflow

After login, the dashboard displays:

```text
Welcome, User

Vendors
Search
Cart
Profile
```

It also displays marketplace statistics:

```text
Number of Vendors
Number of Products
Number of Cart Items
```

The frontend renders the vendor cards dynamically using JavaScript.

---

# 4. Vendor Workflow

The current demo contains four vendors:

```text
Samsung
Godrej
HP
Intel
```

Each vendor contains:

```text
Vendor ID
Vendor Name
Vendor Address
Vendor Email
Commission Rate
Rating
```

Example:

```text
Samsung
Noida, India
sales@samsung.com
Commission: 8%
Rating: 4.8
```

When the user clicks:

```text
View Products
```

JavaScript filters products using the vendor ID and displays products belonging to that vendor.

---

# 5. Product Workflow

The demo product catalog contains products from Samsung, Godrej, HP, and Intel.

Example:

```text
Samsung
 ├── Samsung Galaxy S25
 ├── Samsung Smart Monitor
 └── Samsung SSD 1TB

Godrej
 ├── Godrej Refrigerator
 └── Godrej Washing Machine

HP
 ├── HP Pavilion Laptop
 └── HP Wireless Mouse

Intel
 ├── Intel Core i7 Processor
 └── Intel Core i5 Processor
```

Each product contains:

```text
productid
productname
productdescription
productprice
productquantity
vendorsid
```

Products with zero stock are not displayed.

---

# 6. Search Workflow

The dashboard and Search page provide product search.

The user can search using:

```text
Product Name
Product Description
```

For example:

```text
Search:
SSD
```

JavaScript converts the search keyword to lowercase and checks the product name and description.

Only products with available stock are returned.

---

# 7. Add to Cart Workflow

The user selects a quantity and clicks:

```text
Add
```

JavaScript then:

1. Finds the product.
2. Reads the requested quantity.
3. Checks that the quantity is valid.
4. Checks available stock.
5. Checks whether the product already exists in the cart.
6. Updates the existing quantity or adds a new cart item.
7. Saves the cart in `localStorage`.
8. Updates the cart counter.

Cart item structure:

```text
productid
productname
price
quantity
vendorsid
```

---

# 8. Cart Workflow

The cart displays:

```text
Product
Vendor
Price
Quantity
Subtotal
```

For each item:

```text
Subtotal = Price × Quantity
```

The total is:

```text
Total = Sum of all Subtotals
```

The user can:

```text
Update quantity
Remove product
Continue shopping
Place order
```

The JavaScript implementation stores the cart in browser `localStorage`.

---

# 9. Place Order Workflow

The current frontend implements order placement as a **demo/simulation**.

When the user clicks:

```text
Place Order
```

JavaScript:

1. Checks whether the cart is empty.
2. Calculates the total.
3. Reduces the demo product quantity.
4. Generates a demo order ID.
5. Clears the cart.
6. Saves the updated state.
7. Displays an order-success notification.
8. Returns to the dashboard.

Example:

```text
Cart
 ↓
Calculate Total
 ↓
Reduce Demo Stock
 ↓
Generate Order ID
 ↓
Clear Cart
 ↓
Order Successful
```

The generated order ID has the format:

```text
ORD-xxxxxxx
```

---

# 10. Python Order Workflow

The Python `main.py` contains the database-backed order workflow.

When placing an order, Python:

```text
Check Cart
     ↓
Calculate Total
     ↓
Insert into orders
     ↓
Get order_id
     ↓
Insert each item into order_items
     ↓
Reduce productquantity
     ↓
Commit
     ↓
Clear cart
```

The `orders` table receives:

```text
customer_id
total_price
```

The `order_items` table receives:

```text
order_id
product_id
vendor_id
quantity
product_price
subtotal
```

The product stock is then reduced in the `products` table.

If an exception occurs, the Python code performs:

```text
ROLLBACK
```

instead of committing the incomplete transaction.

---

# 11. Database Structure

The Python project uses:

```text
Database:
multivendor_marketing
```

Main tables:

```text
customer
users
vendors
products
orders
order_items
```

Relationship:

```text
customer
   │
   │ customer_id
   ▼
 users

vendors
   │
   │ vendor_id
   ▼
 products

customer
   │
   │ customer_id
   ▼
 orders
   │
   │ order_id
   ▼
 order_items
   │
   ├── product_id
   └── vendor_id
```

---

# 12. Python Functions

The current Python file contains these major functions:

| Function | Purpose |
|---|---|
| `get_connection()` | Creates the MySQL connection |
| `signup()` | Creates customer and login records |
| `signin()` | Authenticates a customer |
| `show_vendors()` | Retrieves vendors |
| `show_vendor_products()` | Retrieves products for a vendor |
| `add_to_cart()` | Adds or updates a cart item |
| `view_cart()` | Calculates and displays cart total |
| `place_order()` | Creates order and order items |
| `vendor_menu()` | Handles vendor/product selection |
| `dashboard()` | Runs the customer dashboard |
| `main()` | Starts the application |

---

# 13. Frontend JavaScript Functions

Important JavaScript functions include:

| Function | Purpose |
|---|---|
| `saveState()` | Saves user/cart state in localStorage |
| `toast()` | Displays notifications |
| `updateCartCount()` | Updates cart counters |
| `showAuth()` | Switches Sign In / Sign Up |
| `login()` | Opens the application after login |
| `logout()` | Clears user/cart state |
| `fillUser()` | Displays user information |
| `showPage()` | Handles frontend page navigation |
| `renderDashboard()` | Renders vendors and dashboard statistics |
| `openVendor()` | Opens a vendor's products |
| `productCards()` | Generates product cards |
| `addToCart()` | Adds a product to the cart |
| `renderCart()` | Displays cart contents |
| `updateCart()` | Updates cart quantity |
| `removeCart()` | Removes a cart item |
| `placeOrder()` | Simulates placing an order |
| `performSearch()` | Searches products |
| `renderProfile()` | Displays profile information |

---

# 14. Current Frontend Data Mode

The JavaScript currently contains:

```javascript
const API_MODE = false;
```

Therefore, the browser currently uses demo data.

The demo vendors are defined directly in `app.js`, and demo products are also defined there.

The cart and user state are stored using:

```javascript
localStorage
```

This means the current frontend can be opened and tested without connecting to the Python/MySQL backend.

---

# 15. Connecting Frontend to Python/MySQL

The JavaScript already contains a placeholder for API integration.

The intended architecture is:

```text
Browser
   │
   │ HTTP / JSON
   ▼
Python HTTP Layer
   │
   ▼
Python Functions
   │
   ▼
MySQL
```

The frontend can eventually call endpoints such as:

```text
POST /api/signup
POST /api/signin

GET /api/vendors
GET /api/vendors/<vendor_id>/products

GET /api/products/search?q=<keyword>

POST /api/cart/add
POST /api/cart/update
POST /api/cart/remove

POST /api/order
```

When API integration is implemented, the frontend can change from demo data to database data.

---

# 16. Important Current Limitation

The current `app.js` is a frontend/demo implementation.

It does **not currently send the login, signup, cart, or order operations to MySQL**.

For example, the current login section explicitly uses a demo login and accepts any entered username/password for UI testing.

Similarly, the current `placeOrder()` function changes the demo product stock in JavaScript and generates a demo order ID. It does not insert an order into the MySQL `orders` table.

The Python `main.py`, however, contains the actual MySQL-backed implementations for these operations.

Therefore:

```text
Current:
HTML + CSS + JS → localStorage / demo data

Python:
Python → MySQL
```

The next integration step is:

```text
HTML + CSS + JS
       ↓
Python HTTP Server
       ↓
main.py functions
       ↓
MySQL
```

---

# 17. Running the Frontend

The frontend consists of:

```text
index.html
style.css
app.js
```

Keep the three files in the same directory:

```text
MarketHub/
│
├── index.html
├── style.css
└── app.js
```

Then open:

```text
index.html
```

in a browser.

Alternatively, use VS Code Live Server.

---

# 18. MySQL Configuration

The Python file currently uses:

```python
host="localhost"
user="admin"
password="Admin@12345"
database="multivendor_marketing"
```

The database must contain the tables expected by `main.py`.

For production, database credentials should not be hard-coded in the source code.

---

# 19. Security Improvements

Before using this project in production:

- Hash passwords with bcrypt or Argon2.
- Do not expose MySQL credentials to frontend JavaScript.
- Validate all input on the Python side.
- Use parameterized SQL queries.
- Validate stock again when creating an order.
- Implement proper authentication/session handling.
- Protect order APIs from unauthorized users.
- Do not trust prices or quantities supplied by the browser.
- Move database credentials to environment variables.

---

# 20. Future Improvements

Possible features:

```text
Order History
Order Status
Vendor Dashboard
Admin Dashboard
Product Categories
Product Images
Wishlist
Product Reviews
Payment Gateway
Delivery Tracking
Vendor Product Management
Inventory Alerts
Password Hashing
Authentication Sessions
Product Filtering
Product Sorting
Pagination
```

---

# 21. Project Summary

MarketHub demonstrates a multi-vendor shopping workflow:

```text
                    MarketHub
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
 Authentication      Vendors         Search
       │               │               │
       └───────────────┼───────────────┘
                       ▼
                    Products
                       │
                       ▼
                      Cart
                       │
                       ▼
                  Place Order
                       │
              ┌────────┴────────┐
              ▼                 ▼
           Orders          Order Items
              │                 │
              └────────┬────────┘
                       ▼
                 Stock Update
                       │
                       ▼
                     MySQL
```

The frontend provides the marketplace experience, while `main.py` contains the database-backed business logic for users, vendors, products, carts, orders, and inventory.
