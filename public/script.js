const API_URL = "http://localhost:5000"; // ✅ backend base URL

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
    window.location.href = "index.html";
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
      window.location.href = "home.html";
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
  document.getElementById("popupForm").style.display = "block";
  document.getElementById("deleteBtn").style.display = "none"; // hide delete by default
}

function closeForm() {
  document.getElementById("popupForm").style.display = "none";

  // Reset fields
  document.getElementById("medicineName").value = "";
  document.getElementById("description").value = "";
  document.getElementById("price").value = "";
  document.getElementById("image").value = "";

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
  const imageFile = document.getElementById("image")?.files[0];

  if (!medicineName || !description || !price || !imageFile) {
    alert("Please fill all product fields");
    return;
  }

  const formData = new FormData();
  formData.append("medicineName", medicineName);
  formData.append("description", description);
  formData.append("price", price);
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
  const imageFile = document.getElementById("image")?.files[0];

  if (!medicineName || !description || !price) {
    alert("Please fill all fields");
    return;
  }

  const formData = new FormData();
  formData.append("medicineName", medicineName);
  formData.append("description", description);
  formData.append("price", price);
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
  document.getElementById("medicineName").value = product.medicineName;
  document.getElementById("description").value = product.description;
  document.getElementById("price").value = product.price;

  document.getElementById("popupForm").setAttribute("data-id", product._id);

  // Update UI
  document.querySelector("#popupForm h3").textContent = "Update Medicine";
  const addBtn = document.querySelector("#popupForm button.add-btn");
  if (addBtn) {
    addBtn.textContent = "Update Product";
    addBtn.onclick = updateProduct;
  }

  // Set delete button dynamically
  document.getElementById("deleteBtn").setAttribute("onclick", `deleteProduct('${product._id}')`);
}

// ====================================================
// Load All Products
// ====================================================
async function loadProducts() {
  const list = document.getElementById("productList");
  const role = localStorage.getItem("role");
  const popupForm = document.getElementById("popupForm");

  // Hide add button & popup if user is not admin
  if (role !== "admin") {
    if (popupForm) popupForm.style.display = "none";
  }
  if (!list) return;

  try {
    const products = await fetchJSON(`${API_URL}/api/products`);
    const role = localStorage.getItem("role");

    list.innerHTML = ""; // Clear
    const fragment = document.createDocumentFragment();

products.forEach(p => {
      const card = document.createElement("div");
      card.classList.add("card");

      let buttonHTML = "";
      if (role === "admin") {
        // Admin: show Update + Delete on same line
        buttonHTML = `
          <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
            <button onclick='openUpdateForm(${JSON.stringify(p)})'>Update</button>
            <button onclick="deleteProduct('${p._id}')">Delete</button>
          </div>
        `;
      } else {
        // User: show Buy Now
        buttonHTML = `
          <div style="text-align:center; margin-top:10px;">
            <button onclick="buyProduct('${p._id}')">Buy Now</button>
          </div>
        `;
      }

      card.innerHTML = `
        <img src="${p.image}" width="100%">
        <h4>${p.medicineName}</h4>
        <p>${p.description}</p>
        <p><b>₹${p.price}</b></p>
        ${buttonHTML}
      `;

      fragment.appendChild(card);
    });

    list.appendChild(fragment);
  } catch (err) {
    console.error("Failed to load products:", err);
    alert("Failed to load products. See console.");
  }
}

// ====================================================
// Buy Product (Placeholder)
// ====================================================
function buyProduct(productId) {
  alert(`Buying product ID: ${productId}`); j
}

// ====================================================
// Auto-load products on home.html
// ====================================================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("productList")) {
    loadProducts();
  }
});
