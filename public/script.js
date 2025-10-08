// const API_URL = "http://localhost:5000"; // ✅ backend base URL
const API_URL = "https://medical-project-1pwz.onrender.com";
// ====================================================
// Common Fetch Utility
// ====================================================
async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();

    if (!res.ok) {
      console.error("Fetch failed:", res.status, text);
      throw new Error(text || "Request failed");
    }

    return JSON.parse(text);
  } catch (err) {
    console.error("Fetch Error:", err);
    throw err;
  }
}

// ====================================================
// Signup
// ====================================================
async function signup() {
  const username = document.getElementById("signupUser")?.value.trim();
  const password = document.getElementById("signupPass")?.value.trim();
  const role = document.getElementById("signupRole")?.value;

  if (!username || !password || !role) {
    alert("Please fill all fields");
    return;
  }

  try {
    const data = await fetchJSON(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role })
    });

    alert(data.message || "Signup successful");
    window.location.href = "../index.html";
  } catch (err) {
    alert("Signup failed. See console for details.");
  }
}

// ====================================================
// Login
// ====================================================
async function login() {
  const username = document.getElementById("loginUser")?.value.trim();
  const password = document.getElementById("loginPass")?.value.trim();
  const role = document.getElementById("loginRole")?.value;

  if (!username || !password || !role) {
    alert("Please fill all fields");
    return;
  }

  try {
    const data = await fetchJSON(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role })
    });

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);
      window.location.href = "public/home.html";
    } else {
      alert(data.error || "Login failed");
    }
  } catch (err) {
    alert("Login failed. See console for details.");
  }
}

// ====================================================
// Popup Form Controls
// ====================================================
function openForm() {
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    alert("Only admins can add maedicines!");
    return;
  }

  document.getElementById("popupForm").style.display = "block";
  document.getElementById("deleteBtn").style.display = "none"; // hide delete by default
}

function closeForm() {
  document.getElementById("popupForm").style.display = "none";

  // Reset all fields
  ["medicineName", "description", "price", "image", "dosageForm", "uses", "manufacturer", "expiryDate", "drugNumber"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

  // Reset heading & button text
  document.getElementById("popupForm").removeAttribute("data-id");
  document.querySelector("#popupForm h3").textContent = "Add Medicine";
  const addBtn = document.querySelector("#popupForm button.add-btn");
  if (addBtn) {
    addBtn.textContent = "Add Product";
    addBtn.setAttribute("onclick", "addProduct()");
  }

  document.getElementById("deleteBtn").style.display = "none";
}

// ====================================================
// Add Product
// ====================================================
async function addProduct() {
  const medicineName = document.getElementById("medicineName")?.value.trim();
  const description = document.getElementById("description")?.value.trim();
  const price = document.getElementById("price")?.value.trim();
  const dosageForm = document.getElementById("dosageForm")?.value.trim();
  const uses = document.getElementById("uses")?.value.trim();
  const manufacturer = document.getElementById("manufacturer")?.value.trim();
  const expiryDate = document.getElementById("expiryDate")?.value;
  const drugNumber = document.getElementById("drugNumber")?.value.trim();
  const imageFile = document.getElementById("image")?.files[0];

  if (!medicineName || !description || !price || !imageFile || !dosageForm || !uses || !manufacturer || !expiryDate || !drugNumber) {
    alert("Please fill all product fields");
    return;
  }

  const formData = new FormData();
  formData.append("medicineName", medicineName);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("dosageForm", dosageForm);
  formData.append("uses", uses);
  formData.append("manufacturer", manufacturer);
  formData.append("expiryDate", expiryDate);
  formData.append("drugNumber", drugNumber);
  formData.append("image", imageFile);

  try {
    await fetchJSON(`${API_URL}/api/products/add`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    alert("Product added successfully!");
    closeForm();
    loadProducts();
  } catch (err) {
    alert("Failed to add product. See console for details.");
  }
}

// ====================================================
// Update Product
// ====================================================
async function updateProduct() {
  const productId = document.getElementById("popupForm").getAttribute("data-id");
  const medicineName = document.getElementById("medicineName")?.value.trim();
  const description = document.getElementById("description")?.value.trim();
  const price = document.getElementById("price")?.value.trim();
  const dosageForm = document.getElementById("dosageForm")?.value.trim();
  const uses = document.getElementById("uses")?.value.trim();
  const manufacturer = document.getElementById("manufacturer")?.value.trim();
  const expiryDate = document.getElementById("expiryDate")?.value;
  const drugNumber = document.getElementById("drugNumber")?.value.trim();
  const imageFile = document.getElementById("image")?.files[0];

  if (!medicineName || !description || !price) {
    alert("Please fill all required fields");
    return;
  }

  const formData = new FormData();
  formData.append("medicineName", medicineName);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("dosageForm", dosageForm);
  formData.append("uses", uses);
  formData.append("manufacturer", manufacturer);
  formData.append("expiryDate", expiryDate);
  formData.append("drugNumber", drugNumber);
  if (imageFile) formData.append("image", imageFile);

  try {
    await fetchJSON(`${API_URL}/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    alert("Product updated successfully!");
    closeForm();
    loadProducts();
  } catch (err) {
    alert("Failed to update product. See console for details.");
  }
}

// ====================================================
// Delete Product
// ====================================================
async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    await fetchJSON(`${API_URL}/api/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    alert("Product deleted successfully!");
    closeForm();
    loadProducts();
  } catch (err) {
    alert("Failed to delete product. See console for details.");
  }
}

// ====================================================
// Open Update Product Form (Prefill)
// ====================================================
function openUpdateForm(product) {
  document.getElementById("popupForm").style.display = "block";
  document.getElementById("deleteBtn").style.display = "inline-block";

  // Prefill form
  document.getElementById("medicineName").value = product.medicineName || "";
  document.getElementById("description").value = product.description || "";
  document.getElementById("price").value = product.price || "";
  document.getElementById("dosageForm").value = product.dosageForm || "";
  document.getElementById("uses").value = product.uses || "";
  document.getElementById("manufacturer").value = product.manufacturer || "";
  document.getElementById("expiryDate").value = product.expiryDate ? product.expiryDate.split("T")[0] : "";
  document.getElementById("drugNumber").value = product.drugNumber || "";

  document.getElementById("popupForm").setAttribute("data-id", product._id);

  document.querySelector("#popupForm h3").textContent = "Update Medicine";
  const addBtn = document.querySelector("#popupForm button.add-btn");
  if (addBtn) {
    addBtn.textContent = "Update Product";
    addBtn.onclick = updateProduct;
  }

  document.getElementById("deleteBtn").setAttribute("onclick", `deleteProduct('${product._id}')`);
}

// ====================================================
// Load All Products
// ====================================================
async function loadProducts() {
  const list = document.getElementById("productList");
  const role = localStorage.getItem("role");
  const loading = document.getElementById("loadingIndicator");
  const errorMsg = document.getElementById("errorMessage");

  if (!list) return;
  if (loading) loading.style.display = "block";
  if (errorMsg) errorMsg.style.display = "none";

  try {
    const products = await fetchJSON(`${API_URL}/api/products`);
    if (loading) loading.style.display = "none";

    list.innerHTML = "";
    if (!products || products.length === 0) {
      if (errorMsg) errorMsg.style.display = "block";
      return;
    }

    const fragment = document.createDocumentFragment();

    products.forEach(p => {
      const card = document.createElement("div");
      card.classList.add("card");

      let buttonHTML = "";
      if (role === "admin") {
        buttonHTML = `
          <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
            <button onclick='openUpdateForm(${JSON.stringify(p)})'>Update</button>
            <button onclick="deleteProduct('${p._id}')">Delete</button>
          </div>`;
      } else {
        buttonHTML = `
          <div style="text-align:center; margin-top:10px;">
            <button onclick="buyProduct('${p._id}')">Buy Now</button>
          </div>`;
      }

      card.innerHTML = `
        <img src="${p.image === "" ? "https://imgs.search.brave.com/_BcaBM5C2c42r7KE0RSaGYpHWUVbwm3N-0VBFBepuf0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/Z3N0YXRpYy5jb20v/Zm1kL2ltYWdlcy9t/YXBfYXZhdGFycy9m/bWRfbGFuZGluZ19w/YWdlX21hcC5zdmc" : p.image}" width="100%">
        <h4>${p.medicineName}</h4>
        <p><b>Drug Code:</b> ${p.drugNumber || "N/A"}</p>
        <p><b>Dosage Form:</b> ${p.dosageForm || "N/A"}</p>
        <p><b>Uses:</b> ${p.uses || "N/A"}</p>
        <p><b>Manufacturer:</b> ${p.manufacturer || "N/A"}</p>
        <p><b>Expiry:</b> ${p.expiryDate ? p.expiryDate.split("T")[0] : "N/A"}</p>
        <p>${p.description}</p>
        <p><b>₹${p.price}</b></p>
        ${buttonHTML}
      `;

      fragment.appendChild(card);
    });

    list.appendChild(fragment);
  } catch (err) {
    console.error("Failed to load products:", err);
    if (loading) loading.style.display = "none";
    if (errorMsg) errorMsg.style.display = "block";
  }
}

// ====================================================
// Buy Product (Placeholder)
// ====================================================
function buyProduct(productId) {
  alert(`Buying product ID: ${productId}`);
}

// ====================================================
// Auto-load products on home.html
// ====================================================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("productList")) {
    loadProducts();
  }
  // 🚫 Hide popup form completely for non-admin users
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    const popupForm = document.getElementById("popupForm");
    if (popupForm) popupForm.style.display = "none";
  }
});
