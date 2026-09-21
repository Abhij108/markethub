/*
  Frontend UI for the functions in the supplied main.py.

  DEMO DATA is enabled by default so the UI can be opened directly.
  To connect to your Flask/MySQL backend, set API_MODE = true and
  expose matching JSON endpoints in main.py.
*/

const API_MODE = false;

const demoVendors = [
  {id:1,vendor_name:"Samsung",vendor_address:"Noida, India",vendor_email:"sales@samsung.com",commission_rate:8,rating:4.8},
  {id:2,vendor_name:"Godrej",vendor_address:"Mumbai, India",vendor_email:"sales@godrej.com",commission_rate:7,rating:4.6},
  {id:3,vendor_name:"HP",vendor_address:"Bangalore, India",vendor_email:"sales@hp.com",commission_rate:6,rating:4.7},
  {id:4,vendor_name:"Intel",vendor_address:"Bangalore, India",vendor_email:"sales@intel.com",commission_rate:5,rating:4.9}
];

const demoProducts = [
  {productid:101,productname:"Samsung Galaxy S25",productdescription:"Premium smartphone with high performance and AMOLED display.",productprice:74999,productquantity:15,vendorsid:1},
  {productid:102,productname:"Samsung Smart Monitor",productdescription:"Smart display suitable for work, entertainment and productivity.",productprice:24999,productquantity:12,vendorsid:1},
  {productid:103,productname:"Samsung SSD 1TB",productdescription:"Fast 1TB storage drive for laptops and desktops.",productprice:7999,productquantity:25,vendorsid:1},
  {productid:201,productname:"Godrej Refrigerator",productdescription:"Energy efficient refrigerator for modern homes.",productprice:32999,productquantity:10,vendorsid:2},
  {productid:202,productname:"Godrej Washing Machine",productdescription:"Fully automatic washing machine with multiple wash modes.",productprice:28999,productquantity:8,vendorsid:2},
  {productid:301,productname:"HP Pavilion Laptop",productdescription:"Everyday laptop for study, coding and office work.",productprice:62999,productquantity:10,vendorsid:3},
  {productid:302,productname:"HP Wireless Mouse",productdescription:"Comfortable wireless mouse for everyday productivity.",productprice:899,productquantity:30,vendorsid:3},
  {productid:401,productname:"Intel Core i7 Processor",productdescription:"High performance processor for desktop systems.",productprice:38999,productquantity:14,vendorsid:4},
  {productid:402,productname:"Intel Core i5 Processor",productdescription:"Balanced processor for development and productivity.",productprice:21999,productquantity:18,vendorsid:4}
];

let state = {
  user: JSON.parse(localStorage.getItem("market_user") || "null"),
  cart: JSON.parse(localStorage.getItem("market_cart") || "[]"),
  vendors: demoVendors,
  products: demoProducts
};

const $ = id => document.getElementById(id);
const money = n => "₹" + Number(n).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});

function saveState(){
  localStorage.setItem("market_user", JSON.stringify(state.user));
  localStorage.setItem("market_cart", JSON.stringify(state.cart));
  updateCartCount();
}

function toast(message,type="success"){
  const el=document.createElement("div");
  el.className="toast "+type;
  el.textContent=message;
  $("toast-container").appendChild(el);
  setTimeout(()=>el.remove(),2800);
}

function updateCartCount(){
  const count=state.cart.reduce((s,i)=>s+Number(i.quantity),0);
  $("cart-count").textContent=count;
  $("dashboard-cart-count").textContent=count;
  document.querySelectorAll(".cart-count-inline").forEach(x=>x.textContent=count);
}

function showAuth(type){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.auth===type));
  $("login-form").classList.toggle("hidden",type!=="login");
  $("signup-form").classList.toggle("hidden",type!=="signup");
}

function login(user){
  state.user=user;
  saveState();
  $("auth-screen").classList.add("hidden");
  $("app-screen").classList.remove("hidden");
  fillUser();
  showPage("dashboard");
}

function logout(){
  state.user=null;
  state.cart=[];
  saveState();
  $("app-screen").classList.add("hidden");
  $("auth-screen").classList.remove("hidden");
  showAuth("login");
  toast("Logged out successfully");
}

function fillUser(){
  if(!state.user) return;
  const name=state.user.name || "User";
  $("profile-name").textContent=name;
  $("profile-avatar").textContent=name[0].toUpperCase();
  $("welcome-name").textContent=name;
  $("dropdown-name").textContent=name;
  $("dropdown-email").textContent=state.user.mail || "";
  renderProfile();
}

function showPage(page){
  if(!state.user) return;
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  const target=$(page+"-page");
  if(target) target.classList.remove("hidden");
  if(page==="dashboard") renderDashboard();
  if(page==="cart") renderCart();
  if(page==="search") $("search-input").focus();
}

function renderDashboard(){
  $("vendor-count").textContent=state.vendors.length;
  $("vendor-label").textContent=state.vendors.length+" vendors";
  $("product-count").textContent=state.products.length;
  updateCartCount();

  $("vendors-grid").innerHTML=state.vendors.map(v=>`
    <article class="vendor-card">
      <div class="vendor-top">
        <div class="vendor-avatar">${v.vendor_name[0]}</div>
        <div><h3>${v.vendor_name}</h3><div class="rating">★ ${v.rating}</div></div>
      </div>
      <p>📍 ${v.vendor_address}</p>
      <p>✉ ${v.vendor_email}</p>
      <div class="vendor-meta">Commission ${v.commission_rate}%</div>
      <button class="vendor-btn" onclick="openVendor(${v.id})">View Products →</button>
    </article>
  `).join("");
}

function openVendor(id){
  const vendor=state.vendors.find(v=>v.id===id);
  if(!vendor) return;
  $("vendor-title").textContent=vendor.vendor_name;
  $("vendor-details").textContent=`${vendor.vendor_address} · ${vendor.vendor_email}`;
  const products=state.products.filter(p=>p.vendorsid===id && p.productquantity>0);
  $("product-label").textContent=products.length+" available";
  $("products-grid").innerHTML=productCards(products);
  showPage("products");
}

function productCards(products){
  if(!products.length) return `<div class="empty"><h3>No products available</h3><p>This vendor currently has no products in stock.</p></div>`;
  return products.map(p=>`
    <article class="product-card">
      <div class="product-image">${p.productname[0]}</div>
      <div class="product-body">
        <div class="stock">IN STOCK · ${p.productquantity}</div>
        <h3>${p.productname}</h3>
        <p>${p.productdescription}</p>
        <div class="product-bottom">
          <strong>${money(p.productprice)}</strong>
          <form class="add-form" onsubmit="addToCart(event,${p.productid})">
            <input type="number" name="quantity" value="1" min="1" max="${p.productquantity}">
            <button>Add</button>
          </form>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(event,id){
  event.preventDefault();
  const product=state.products.find(p=>p.productid===id);
  const qty=Number(new FormData(event.target).get("quantity"));
  if(!product || qty<=0) return toast("Invalid quantity","error");
  if(qty>product.productquantity) return toast(`Only ${product.productquantity} items are available.`,"error");

  const existing=state.cart.find(i=>i.productid===id);
  if(existing){
    if(existing.quantity+qty>product.productquantity) return toast("Not enough stock.","error");
    existing.quantity+=qty;
  }else{
    state.cart.push({productid:id,productname:product.productname,price:Number(product.productprice),quantity:qty,vendorsid:product.vendorsid});
  }
  saveState();
  toast("Product added to cart");
}

function renderCart(){
  updateCartCount();
  const wrap=$("cart-content");
  if(!state.cart.length){
    wrap.innerHTML=`<div class="empty"><div style="font-size:45px">🛒</div><h2>Your cart is empty</h2><p>Add products from a vendor to start shopping.</p><button class="primary-btn" onclick="showPage('dashboard')">Browse Vendors</button></div>`;
    return;
  }

  const total=state.cart.reduce((s,i)=>s+i.price*i.quantity,0);
  wrap.innerHTML=`
    <div class="cart-layout">
      <div class="cart-list">
        ${state.cart.map(i=>`
          <article class="cart-item">
            <div class="cart-avatar">${i.productname[0]}</div>
            <div class="cart-info"><h3>${i.productname}</h3><p>Vendor #${i.vendorsid} · ${money(i.price)} each</p></div>
            <form class="qty-form" onsubmit="updateCart(event,${i.productid})">
              <input name="quantity" type="number" min="1" value="${i.quantity}">
              <button>Update</button>
            </form>
            <strong>${money(i.price*i.quantity)}</strong>
            <button class="remove-btn" onclick="removeCart(${i.productid})">Remove</button>
          </article>
        `).join("")}
      </div>
      <aside class="summary">
        <h2>Order Summary</h2>
        <div class="summary-row"><span>Items</span><span>${state.cart.reduce((s,i)=>s+i.quantity,0)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>
        <button class="primary-btn" onclick="placeOrder()">Place Order</button>
        <a class="continue" href="#" onclick="showPage('dashboard');return false">Continue Shopping</a>
      </aside>
    </div>`;
}

function updateCart(event,id){
  event.preventDefault();
  const qty=Number(new FormData(event.target).get("quantity"));
  const item=state.cart.find(i=>i.productid===id);
  const product=state.products.find(p=>p.productid===id);
  if(!item || !product) return;
  if(qty<=0){removeCart(id);return}
  if(qty>product.productquantity) return toast(`Only ${product.productquantity} items are available.`,"error");
  item.quantity=qty;
  saveState(); renderCart(); toast("Cart updated");
}

function removeCart(id){
  state.cart=state.cart.filter(i=>i.productid!==id);
  saveState(); renderCart(); toast("Product removed");
}

function placeOrder(){
  if(!state.cart.length) return toast("Cart is empty","error");
  const total=state.cart.reduce((s,i)=>s+i.price*i.quantity,0);

  state.cart.forEach(item=>{
    const product=state.products.find(p=>p.productid===item.productid);
    if(product) product.productquantity-=item.quantity;
  });

  const orderId="ORD-"+Date.now().toString().slice(-7);
  state.cart=[];
  saveState();
  toast(`Order ${orderId} placed successfully · ${money(total)}`);
  showPage("dashboard");
}

function performSearch(keyword){
  const q=keyword.trim().toLowerCase();
  const results=state.products.filter(p=>
    p.productquantity>0 &&
    (p.productname.toLowerCase().includes(q)||p.productdescription.toLowerCase().includes(q))
  );
  $("search-results").innerHTML=productCards(results);
}

function renderProfile(){
  $("profile-card").innerHTML=`
    <div class="profile-row"><strong>Name</strong><span>${state.user.name||"-"}</span></div>
    <div class="profile-row"><strong>Email</strong><span>${state.user.mail||"-"}</span></div>
    <div class="profile-row"><strong>Phone</strong><span>${state.user.phone||"-"}</span></div>
    <div class="profile-row"><strong>Address</strong><span>${state.user.address||"-"}</span></div>
    <div class="profile-row"><strong>Username</strong><span>${state.user.username||"-"}</span></div>`;
}

/* Auth */
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>showAuth(t.dataset.auth)));

$("login-form").addEventListener("submit",e=>{
  e.preventDefault();
  const username=$("login-username").value.trim();
  const password=$("login-password").value;

  if(API_MODE){
    // Replace with fetch('/api/signin', {method:'POST', ...}) when backend APIs are enabled.
  }

  // Demo login. Any username/password is accepted for UI testing.
  login({name:username||"User",username,mail:"customer@example.com",phone:"",address:""});
  toast("Welcome back!");
});

$("signup-form").addEventListener("submit",e=>{
  e.preventDefault();
  const user={
    name:$("signup-name").value.trim(),
    mail:$("signup-mail").value.trim(),
    phone:$("signup-phone").value.trim(),
    address:$("signup-address").value.trim(),
    username:$("signup-username").value.trim()
  };
  localStorage.setItem("pending_user",JSON.stringify(user));
  toast("Account created. Please sign in.");
  $("login-username").value=user.username;
  showAuth("login");
});

$("logout-btn").addEventListener("click",logout);
$("profile-btn").addEventListener("click",()=>$("profile-dropdown").classList.toggle("hidden"));

document.addEventListener("click",e=>{
  const page=e.target.closest("[data-page]");
  if(page){e.preventDefault();showPage(page.dataset.page)}
});

$("dashboard-search").addEventListener("submit",e=>{
  e.preventDefault();
  $("search-input").value=$("dashboard-search-input").value;
  showPage("search");
  performSearch($("dashboard-search-input").value);
});

$("search-form").addEventListener("submit",e=>{
  e.preventDefault();
  performSearch($("search-input").value);
});

if(state.user){
  $("auth-screen").classList.add("hidden");
  $("app-screen").classList.remove("hidden");
  fillUser();
  showPage("dashboard");
}else{
  $("auth-screen").classList.remove("hidden");
}
