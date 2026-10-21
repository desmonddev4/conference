async function refreshRevenue(background = false) {
  const data = await GatherAPI.request("/api/revenue/", { background });
  document.getElementById("revenue-total").textContent = GatherAPI.money(data.total_revenue, 2);
  document.getElementById("revenue-ticket-count").textContent = `Across ${data.total_attendees} registration${data.total_attendees === 1 ? "" : "s"}`;
  for (const method of ["momo", "cash"]) {
    const values = data.by_payment_method[method] || { count: 0, amount: "0.00" };
    document.getElementById(`${method}-count`).textContent = `${values.count} payment${values.count === 1 ? "" : "s"}`;
    document.getElementById(`${method}-amount`).textContent = GatherAPI.money(values.amount, 2);
    document.getElementById(`${method}-bar`).style.width = data.total_revenue === "0.00" ? "0%" : `${Number(values.amount) / Number(data.total_revenue) * 100}%`;
  }
}

(async function loadRevenue() {
  try {
    await refreshRevenue();
  } catch (error) {
    document.getElementById("revenue-total").textContent = error.message;
  }
  window.NSTRefresh.every(() => refreshRevenue(true));
})();
