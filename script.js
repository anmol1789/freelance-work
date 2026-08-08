/* =========================================================
   PANDEY JI CONTENT STUDIO — site logic
   No backend required. Booking requests are sent via a
   pre-filled WhatsApp message to +91 92638 50271.

   HOW OWNER MANAGES ALREADY-CONFIRMED BOOKINGS:
   Add a date + time to CONFIRMED_BOOKINGS below (format shown)
   whenever a slot is confirmed off-site (phone call, in person,
   etc). Redeploy the file and that slot will show as "Booked"
   for every visitor.
========================================================= */

const PHONE = "919263850271"; // WhatsApp number, country code + number, no plus/spaces

// Slots already confirmed manually by the studio.
// Format: "YYYY-MM-DD": ["09:00", "14:00", ...]
const CONFIRMED_BOOKINGS = {
  // "2026-08-05": ["10:00", "15:00"],
};

const WORK_START_HOUR = 9;   // 9 AM
const WORK_END_HOUR = 20;    // 8 PM (last slot starts at 19:00)
const DAYS_AHEAD = 21;       // how many days forward the strip shows

const STORAGE_KEY = "pandeyji_requested_slots_v1";

/* ---------- helpers ---------- */
function pad(n){ return n.toString().padStart(2, "0"); }
function dateKey(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function formatTime(h){
  const period = h >= 12 ? "PM" : "AM";
  let hh = h % 12; if (hh === 0) hh = 12;
  return `${pad(hh)}:00 ${period}`;
}
function readRequested(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  }catch(e){ return {}; }
}
function writeRequested(obj){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }catch(e){ /* ignore */ }
}
function isConfirmed(key, time){
  return (CONFIRMED_BOOKINGS[key] || []).includes(time);
}
function isRequestedLocally(key, time){
  const req = readRequested();
  return (req[key] || []).includes(time);
}
function markRequestedLocally(key, time){
  const req = readRequested();
  if(!req[key]) req[key] = [];
  if(!req[key].includes(time)) req[key].push(time);
  writeRequested(req);
}

/* ---------- state ---------- */
let selectedDateKey = null;
let selectedTime = null;
let dateStripOffset = 0; // in days, for prev/next paging

const today = new Date();
today.setHours(0,0,0,0);

/* ---------- NAV ---------- */
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

burger.addEventListener("click", () => {
  const open = burger.classList.toggle("open");
  burger.setAttribute("aria-expanded", open ? "true" : "false");
  navLinks.classList.toggle("mobile-open", open);
});
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  burger.classList.remove("open");
  navLinks.classList.remove("mobile-open");
}));

/* ---------- REEL SPECIALITY GRID ---------- */
const REELS = [
  { ic:"◐", title:"Event Reels", sub:"Weddings, parties & gatherings" },
  { ic:"◈", title:"Birthday Reels", sub:"Celebration highlight edits" },
  { ic:"◑", title:"Model Reels", sub:"Portfolio & fashion shoots" },
  { ic:"◇", title:"Product Reels", sub:"E-commerce & brand shoots" },
  { ic:"✦", title:"Festival Reels", sub:"Seasonal & cultural content" },
  { ic:"◒", title:"Car Reels", sub:"Automotive showcase films" },
  { ic:"⌂", title:"Real Estate Shoots", sub:"Property walkthroughs" },
  { ic:"◍", title:"& Much More", sub:"Tell us what you need" },
];
const reelGrid = document.getElementById("reelGrid");
reelGrid.innerHTML = REELS.map(r => `
  <div class="reel-tile">
    <span class="reel-ic">${r.ic}</span>
    <strong>${r.title}</strong>
    <span class="reel-sub">${r.sub}</span>
  </div>
`).join("");

/* ---------- DATE STRIP ---------- */
const dateStrip = document.getElementById("dateStrip");
const dateNavPrev = document.getElementById("dateNavPrev");
const dateNavNext = document.getElementById("dateNavNext");
const DOW = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const MON = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function buildDateStrip(){
  dateStrip.innerHTML = "";
  for(let i=0;i<DAYS_AHEAD;i++){
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = dateKey(d);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "date-chip" + (key === selectedDateKey ? " active" : "");
    chip.innerHTML = `
      <span class="dow">${DOW[d.getDay()]}</span>
      <span class="dnum">${pad(d.getDate())}</span>
      <span class="mon">${MON[d.getMonth()]}</span>
    `;
    chip.addEventListener("click", () => selectDate(key, chip));
    dateStrip.appendChild(chip);
  }
}

function selectDate(key, chipEl){
  selectedDateKey = key;
  selectedTime = null;
  document.querySelectorAll(".date-chip").forEach(c => c.classList.remove("active"));
  if(chipEl) chipEl.classList.add("active");
  buildSlotGrid();
  updateSelectedPill();
}

dateNavPrev.addEventListener("click", () => { dateStrip.scrollBy({left:-260, behavior:"smooth"}); });
dateNavNext.addEventListener("click", () => { dateStrip.scrollBy({left:260, behavior:"smooth"}); });

/* ---------- SLOT GRID ---------- */
const slotGrid = document.getElementById("slotGrid");

function buildSlotGrid(){
  slotGrid.innerHTML = "";
  if(!selectedDateKey) return;

  for(let h = WORK_START_HOUR; h < WORK_END_HOUR; h++){
    const time24 = `${pad(h)}:00`;
    const label = formatTime(h);
    const confirmed = isConfirmed(selectedDateKey, time24);
    const pending = !confirmed && isRequestedLocally(selectedDateKey, time24);

    const btn = document.createElement("button");
    btn.type = "button";
    let cls = "slot";
    let tag = "";
    if(confirmed){ cls += " disabled"; tag = "Booked"; }
    else if(pending){ cls += " disabled pending"; tag = "Requested"; }

    btn.className = cls;
    btn.innerHTML = `${label}${tag ? `<span class="slot-tag">${tag}</span>` : ""}`;

    if(!confirmed && !pending){
      btn.addEventListener("click", () => selectSlot(time24, btn));
    }
    if(selectedTime === time24 && !confirmed && !pending){
      btn.classList.add("selected");
    }
    slotGrid.appendChild(btn);
  }
}
function selectSlot(time24, btnEl){
  selectedTime = time24;
  document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected"));
  btnEl.classList.add("selected");
  updateSelectedPill();
}

/* ---------- SELECTED PILL ---------- */
const selectedSlotPill = document.getElementById("selectedSlotPill");
function updateSelectedPill(){
  if(selectedDateKey && selectedTime){
    const [y,m,d] = selectedDateKey.split("-").map(Number);
    const dObj = new Date(y, m-1, d);
    const h = parseInt(selectedTime.split(":")[0], 10);
    selectedSlotPill.textContent = `Selected: ${DOW[dObj.getDay()]} ${pad(d)} ${MON[m-1]} · ${formatTime(h)}`;
    selectedSlotPill.classList.add("filled");
  } else {
    selectedSlotPill.textContent = "No slot selected yet — tap an available time above.";
    selectedSlotPill.classList.remove("filled");
  }
}

/* ---------- FORM SUBMIT ---------- */
const bookingForm = document.getElementById("bookingForm");
const toast = document.getElementById("toast");

function showToast(msg, ms=4200){
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), ms);
}

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if(!selectedDateKey || !selectedTime){
    showToast("Please select an available date & time slot first.");
    document.getElementById("booking").scrollIntoView({behavior:"smooth", block:"start"});
    return;
  }

  const data = new FormData(bookingForm);
  const name = (data.get("name") || "").toString().trim();
  const phone = (data.get("phone") || "").toString().trim();
  const service = (data.get("service") || "").toString().trim();
  const location = (data.get("location") || "").toString().trim();
  const notes = (data.get("notes") || "").toString().trim();

  if(!name || !phone || !service || !location){
    showToast("Please fill in all required fields.");
    return;
  }

  // mark slot as locally requested so it can't be double-picked on this device
  markRequestedLocally(selectedDateKey, selectedTime);

  const [y,m,d] = selectedDateKey.split("-").map(Number);
  const dObj = new Date(y, m-1, d);
  const h = parseInt(selectedTime.split(":")[0], 10);
  const dateLabel = `${DOW[dObj.getDay()]} ${pad(d)} ${MON[m-1]} ${y}`;
  const timeLabel = formatTime(h);

  const message =
`New Booking Request — Pandey Ji Content Studio

Name: ${name}
Phone: ${phone}
Service: ${service}
Location: ${location}
Preferred Date: ${dateLabel}
Preferred Time: ${timeLabel}
Notes: ${notes || "-"}`;

  const waUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank", "noopener");

  showToast("Slot marked as requested. Complete your request on WhatsApp to confirm.");
  buildSlotGrid();
  bookingForm.reset();
  selectedTime = null;
  updateSelectedPill();
});

/* ---------- SCROLL REVEAL ---------- */
const revealTargets = document.querySelectorAll(
  ".service-card, .reel-tile, .process-card, .contact-card, .cert-card, .trust-copy"
);
if("IntersectionObserver" in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.style.opacity = 1;
        entry.target.style.transform = "translateY(0)";
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = "translateY(16px)";
    el.style.transition = "opacity .5s ease, transform .5s ease";
    io.observe(el);
  });
}

/* ---------- INIT ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
buildDateStrip();
// auto-select first date
const firstChip = dateStrip.querySelector(".date-chip");
if(firstChip){ selectDate(dateKey(today), firstChip); }
