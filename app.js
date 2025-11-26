// ZERO GUILT — updated with images + improved cards
const flavours = [
  {
    id: "choc-hazelnut",
    name: "Chocolate Hazelnut",
    desc: "Rich cocoa with crunchy hazelnut ribbons. Decadent but low guilt.",
    tags: ["sugar-free"],
    image: "https://source.unsplash.com/800x600/?chocolate-ice-cream"
  },
  {
    id: "vanilla-light",
    name: "Vanilla Light",
    desc: "Classic vanilla made with skim milk and love.",
    tags: [],
    image: "https://source.unsplash.com/800x600/?vanilla-ice-cream"
  },
  {
    id: "salted-caramel",
    name: "Salted Caramel Swirl",
    desc: "Sweet caramel, a hint of sea salt — perfectly balanced.",
    tags: ["seasonal"],
    image: "https://source.unsplash.com/800x600/?caramel-ice-cream"
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    desc: "Cool mint with real cocoa chips. Bright and refreshing.",
    tags: ["vegan"],
    image: "https://source.unsplash.com/800x600/?mint-ice-cream"
  },
  {
    id: "berry-blush",
    name: "Berry Blush",
    desc: "Mixed berries blended into a light, tangy base.",
    tags: ["vegan", "seasonal"],
    image: "https://source.unsplash.com/800x600/?berry-ice-cream"
  },
  {
    id: "coffee-kiss",
    name: "Coffee Kiss",
    desc: "Bold espresso notes for the coffee lover.",
    tags: [],
    image: "https://source.unsplash.com/800x600/?coffee-ice-cream"
  },
  {
    id: "coconut-dream",
    name: "Coconut Dream",
    desc: "Creamy coconut on a plant-based base, tropical and smooth.",
    tags: ["vegan", "sugar-free"],
    image: "https://source.unsplash.com/800x600/?coconut-ice-cream"
  },
  {
    id: "peanut-butter",
    name: "Peanut Butter Swirl",
    desc: "Nutty, salty and perfectly satisfying.",
    tags: [],
    image: "https://source.unsplash.com/800x600/?peanut-butter-ice-cream"
  }
];

const flavourGrid = document.getElementById("flavourGrid");
const flavourSelect = document.getElementById("flavourSelect");
const feedbackList = document.getElementById("feedbackList");
const feedbackForm = document.getElementById("feedbackForm");
const formMsg = document.getElementById("formMsg");
const clearBtn = document.getElementById("clearFeedback");
const filterButtons = document.querySelectorAll(".filters button");

let currentFilter = "all";
const STORAGE_KEY = "zg_feedback_v1";

// Render flavour cards
function renderFlavours() {
  flavourGrid.innerHTML = "";
  const filtered = flavours.filter(f => {
    if (currentFilter === "all") return true;
    return f.tags.includes(currentFilter);
  });

  for (const f of filtered) {
    const card = document.createElement("div");
    card.className = "card";
    // Use image with lazy loading and alt text; fallback to a colored header if image does not load
    const img = document.createElement("img");
    img.className = "flavour-img";
    img.src = f.image;
    img.alt = `${f.name} — ice cream`;
    img.loading = "lazy";

    const body = document.createElement("div");
    body.className = "card-body";
    body.innerHTML = `
      <h4>${f.name}</h4>
      <p>${f.desc}</p>
      <div class="badges">${f.tags.map(t => `<span class="badge">${t}</span>`).join("")}</div>
    `;

    card.appendChild(img);
    card.appendChild(body);
    flavourGrid.appendChild(card);
  }

  // populate flavour select
  flavourSelect.innerHTML = `<option value="">Select a flavour you tried</option>
    ${flavours.map(f => `<option value="${f.id}">${f.name}</option>`).join("")}
  `;
}

// Feedback storage / retrieval
function loadFeedback() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Feedback parse error", e);
    return [];
  }
}
function saveFeedback(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Render feedback list
function renderFeedback() {
  const list = loadFeedback();
  if (!list.length) {
    feedbackList.innerHTML = `<div class="fb-item"><div class="fb-body">No feedback yet — be the first to share!</div></div>`;
    return;
  }
  feedbackList.innerHTML = "";
  for (const fb of list.slice().reverse()) {
    const flavour = flavours.find(f => f.id === fb.flavour);
    const item = document.createElement("div");
    item.className = "fb-item";
    const date = new Date(fb.ts).toLocaleString();
    item.innerHTML = `
      <div class="fb-meta">
        <div><strong>${escapeHtml(fb.name) || "Anonymous"}</strong> — ${flavour ? flavour.name : "Unknown flavour"}</div>
        <div>${"⭐".repeat(Number(fb.rating)||0)} <span style="color:var(--muted);font-size:12px">· ${date}</span></div>
      </div>
      <div class="fb-body">${escapeHtml(fb.comments || "")}</div>
    `;
    feedbackList.appendChild(item);
  }
}

// simple escaping for text display
function escapeHtml(str){
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

// form submit
feedbackForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    name: (document.getElementById("name").value || "").trim(),
    email: (document.getElementById("email").value || "").trim(),
    flavour: document.getElementById("flavourSelect").value,
    rating: document.getElementById("rating").value,
    comments: document.getElementById("comments").value.trim(),
    ts: Date.now()
  };

  if (!data.flavour || !data.rating) {
    formMsg.textContent = "Please choose a flavour and a rating.";
    return;
  }

  const list = loadFeedback();
  list.push(data);
  saveFeedback(list);
  renderFeedback();
  feedbackForm.reset();
  formMsg.textContent = "Thanks! Your feedback has been recorded.";
  setTimeout(()=> formMsg.textContent = "", 3000);
});

// clear feedback (destructive)
clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all feedback? This cannot be undone.")) return;
  localStorage.removeItem(STORAGE_KEY);
  renderFeedback();
});

// filter buttons
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderFlavours();
  });
});

// initial render
renderFlavours();
renderFeedback();
