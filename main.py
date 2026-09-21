import mysql.connector
def get_connection():

    return mysql.connector.connect(
        host="localhost",
        user="admin",
        password="Admin@12345",
        database="multivendor_marketing"
    )

def signup():

    print(" SIGN UP ")

    name = input("Enter name: ")
    mail = input("Enter email: ")
    phone = input("Enter phone:")
    address = input("Enter address:")
    username = input("Create username: ")
    password = input("Create password: ")

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute(
            "SELECT user_id FROM users WHERE username = %s",
            (username,)
            )

        if cursor.fetchone():

            print("\nUsername already exists.")
            return

        

        cursor.execute(
            """
            INSERT INTO customer
            (name, mail, phone, address)
            VALUES (%s, %s, %s, %s)
            """,
            (name, mail, phone, address)
        )

        customer_id = cursor.lastrowid

    

        cursor.execute(
            """
            INSERT INTO users
            (customer_id, username, password)
            VALUES (%s, %s, %s)
            """,
            (customer_id, username, password)
        )

        conn.commit()

        print("\nAccount created successfully!")

    except Exception as e:

        conn.rollback()
        print("\nSignup failed:", e)

    finally:

        cursor.close()
        conn.close()


def signin():

    print("singin")

    username = input("Username: ")
    password = input("Password: ")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT
            u.user_id,
            u.username,
            u.customer_id,
            c.name,
            c.mail,
            c.phone,
            c.address
        FROM users u
        JOIN customer c
            ON u.customer_id = c.c_id
        WHERE u.username = %s
        AND u.password = %s
    """

    cursor.execute(query, (username, password))

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user:

        print(f"\nWelcome, {user['name']}!")

        return user

    print("\nInvalid username or password.")

    return None


def show_vendors():

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
            SELECT
            id,
            vendor_name,
            vendor_address,
            vendor_email,
            commission_rate,
            rating
            FROM vendors
            """

    cursor.execute(query)

    vendors = cursor.fetchall()

    cursor.close()
    conn.close()

    print("vendors")

    if not vendors:

        print("No vendors available.")

        return []

    for vendor in vendors:

        print(
            f"""
                Vendor ID   : {vendor['id']}
                Name        : {vendor['vendor_name']}
                Address     : {vendor['vendor_address']}
                Email       : {vendor['vendor_email']}
                Rating      : {vendor['rating']}
                """
        )

    return vendors


def show_vendor_products(vendor_id):

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT
            productid,
            productname,
            productdescription,
            productprice,
            productquantity,
            vendorsid
            FROM products
            WHERE vendorsid = %s
            AND productquantity > 0
    """

    cursor.execute(query, (vendor_id,))

    products = cursor.fetchall()

    cursor.close()
    conn.close()

    print("product")

    if not products:

        print("No products available.")

        return []

    for product in products:

        print(
            f"""
                Product ID  : {product['productid']}
                Name        : {product['productname']}
                Description : {product['productdescription']}
                Price       : ₹{product['productprice']}
                Quantity    : {product['productquantity']}
                ----------------------------------------
                """
        )

    return products


def add_to_cart(cart):

    try:

        product_id = int(
            input("\nEnter Product ID: ")
        )

        quantity = int(
            input("Enter Quantity: ")
        )

    except ValueError:

        print("\nPlease enter a valid number.")

        return

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            productid,
            productname,
            productprice,
            productquantity,
            vendorsid
            FROM products
            WHERE productid = %s
        """,
        (product_id,)
    )

    product = cursor.fetchone()

    cursor.close()
    conn.close()

    if not product:

        print("\nProduct not found.")

        return

    if quantity <= 0:

        print("\nInvalid quantity.")

        return

    if quantity > product["productquantity"]:

        print(
            f"\nOnly {product['productquantity']} "
            "items are available."
        )

        return

    for item in cart:

        if item["productid"] == product_id:

            new_quantity = (
                item["quantity"] + quantity
            )

            if new_quantity > product["productquantity"]:

                print("\nNot enough stock.")

                return

            item["quantity"] = new_quantity

            print("\nCart updated.")

            return


    cart.append({
        "productid": product["productid"],
        "productname": product["productname"],
        "price": product["productprice"],
        "quantity": quantity,
        "vendorsid": product["vendorsid"]
    })

    print("\nProduct added to cart.")



def view_cart(cart):

    print("cart")

    if not cart:

        print("Cart is empty.")

        return 0

    total = 0

    for item in cart:

        subtotal = (
            item["price"] *
            item["quantity"]
        )

        total += subtotal

        print(
            f"""
                Product   : {item['productname']}
                Price     : ₹{item['price']}
                Quantity  : {item['quantity']}
                Subtotal  : ₹{subtotal}
                Vendor ID : {item['vendorsid']}
                --------------------------------
            """ 
        )

    print(f"TOTAL: ₹{total}")

    return total




def place_order(user, cart):

    if not cart:

        print("\nCart is empty.")

        return

    total = view_cart(cart)

    confirm = input(
        "Place order? (y/n): "
    )

    if confirm.lower() != "y":

        print("Order cancelled.")

        return

    conn = get_connection()
    cursor = conn.cursor()

    try:

        # Create order

        cursor.execute(
            """
            INSERT INTO orders
            (customer_id, total_price)
            VALUES (%s, %s)
            """,
            (
                user["customer_id"],
                total
            )
        )

        order_id = cursor.lastrowid

        for item in cart:

            subtotal = (
                item["price"] *
                item["quantity"]
            )

            cursor.execute(
                """
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    vendor_id,
                    quantity,
                    product_price,
                    subtotal
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    order_id,
                    item["productid"],
                    item["vendorsid"],
                    item["quantity"],
                    item["price"],
                    subtotal
                )
            )

            # Reduce stock

            cursor.execute(
                """
                UPDATE products
                SET productquantity =
                    productquantity - %s
                WHERE productid = %s
                """,
                (
                    item["quantity"],
                    item["productid"]
                )
            )

        conn.commit()

        print("ORDER PLACED SUCCESSFULLY")
       
        print(f"Order ID: {order_id}")
        print(f"Total: ₹{total}")

        cart.clear()

    except Exception as e:

        conn.rollback()

        print("\nOrder failed:", e)

    finally:

        cursor.close()
        conn.close()



def vendor_menu(cart):

    while True:

        vendors = show_vendors()

        if not vendors:

            return

        print("""
                1. Select Vendor
                2. Back
                """)

        choice = input("Enter choice: ")

        if choice == "1":

            try:

                vendor_id = int(
                    input("\nEnter Vendor ID: ")
                )

            except ValueError:

                print("\nInvalid Vendor ID.")

                continue

            products = show_vendor_products(
                vendor_id
            )

            if not products:

                continue

            while True:

                print("""
                    1. Add Product to Cart
                    2. Back
                    """)

                option = input(
                    "Enter choice: "
                )

                if option == "1":

                    add_to_cart(cart)

                elif option == "2":

                    break

                else:

                    print("\nInvalid choice.")

        elif choice == "2":

            break

        else:

            print("\nInvalid choice.")


def dashboard(user):

    cart = []

    while True:
        print(" MARKETPLACE DASHBOARD")

        print(f"Welcome, {user['name']}")

       
        print("AVAILABLE VENDORS ")

        vendors = show_vendors()

        print("""
                1. Select Vendor
                2. Search Product
                3. View Cart
                4. Place Order
                5. Logout
                """)

        choice = input("Enter choice: ")

        if choice == "1":

            vendor_menu(cart)

        elif choice == "2":

            keyword = input(
                "\nSearch product: "
            )

            conn = get_connection()
            cursor = conn.cursor(dictionary=True)

            search = f"%{keyword}%"

            cursor.execute(
                """
                SELECT
                    productid,
                    productname,
                    productdescription,
                    productprice,
                    productquantity,
                    vendorsid
                FROM products
                WHERE
                    productname LIKE %s
                    OR productdescription LIKE %s
                AND productquantity > 0
                """,
                (search, search)
            )

            products = cursor.fetchall()

            cursor.close()
            conn.close()

            print("search")

            if not products:

                print("No products found.")

            else:

                for product in products:

                    print(
                        f"""
                            ID       : {product['productid']}
                            Name     : {product['productname']}
                            Price    : ₹{product['productprice']}
                            Quantity : {product['productquantity']}
                            Vendor   : {product['vendorsid']}
                            --------------------------------
                            """
                    )

        elif choice == "3":

            view_cart(cart)

        elif choice == "4":

            place_order(user, cart)

        elif choice == "5":

            print("\nLogged out successfully.")

            break

        else:

            print("\nInvalid choice.")



def main():

    while True:

       
        print("MULTI VENDOR MARKETPLACE")
       

        print("""
                1. Sign In
                2. Sign Up
                3. Exit
                """)

        choice = input("Enter choice: ")

        if choice == "1":

            user = signin()

            if user:
                dashboard(user)

        elif choice == "2":

            signup()

        elif choice == "3":

            print("\nThank you for visiting!")

            break

        else:

            print("\nInvalid choice.")


if __name__ == "__main__":

    main()