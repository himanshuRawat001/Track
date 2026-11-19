(function () {
  "use strict";

  const toastEl = document.getElementById("track-toast");
  const toastMsgEl = document.getElementById("track-toast-message");
  const toastCloseBtn = document.getElementById("track-toast-close");
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl || !toastMsgEl) return;
    toastMsgEl.textContent = message;
    toastEl.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.add("hidden");
    }, 3500);
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener("click", () => {
      toastEl.classList.add("hidden");
    });
  }

  // Accessible Confirmation Dialog
  const confirmModal = document.getElementById("track-confirm-modal");
  const confirmMessageEl = document.getElementById("confirm-message");
  const confirmAcceptBtn = document.getElementById("confirm-accept");
  const confirmCancelBtn = document.getElementById("confirm-cancel");
  let confirmResolve = null;

  function openConfirmDialog(message) {
    return new Promise((resolve) => {
      if (!confirmModal || !confirmMessageEl) {
        resolve(false);
        return;
      }
      confirmResolve = resolve;
      confirmMessageEl.textContent = message;
      confirmModal.classList.remove("hidden");
      confirmModal.classList.add("flex");
      confirmAcceptBtn.focus();
    });
  }

  function closeConfirmDialog(result) {
    if (!confirmModal) return;
    confirmModal.classList.add("hidden");
    confirmModal.classList.remove("flex");
    if (confirmResolve) {
      confirmResolve(result);
      confirmResolve = null;
    }
  }

  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener("click", () => closeConfirmDialog(false));
  }
  if (confirmAcceptBtn) {
    confirmAcceptBtn.addEventListener("click", () => closeConfirmDialog(true));
  }

  // Mobile Menu & Workspace Drawer
  const mobileMenuToggle = document.querySelector("[data-mobile-menu-toggle]");
  const publicMobileNav = document.getElementById("public-mobile-nav");
  if (mobileMenuToggle && publicMobileNav) {
    mobileMenuToggle.addEventListener("click", () => {
      const expanded = mobileMenuToggle.getAttribute("aria-expanded") === "true";
      mobileMenuToggle.setAttribute("aria-expanded", String(!expanded));
      publicMobileNav.classList.toggle("hidden");
    });
  }

  const drawerToggle = document.querySelector("[data-workspace-drawer-toggle]");
  const workspaceDrawer = document.getElementById("workspace-mobile-drawer");
  if (drawerToggle && workspaceDrawer) {
    drawerToggle.addEventListener("click", () => {
      workspaceDrawer.classList.toggle("hidden");
    });
  }

  // Student Switcher
  document.querySelectorAll("[data-student-switcher]").forEach((selectEl) => {
    selectEl.addEventListener("change", (event) => {
      const url = new URL(window.location.href);
      const paramName = window.location.pathname.includes("/profile") ? "id" : "studentId";
      url.searchParams.set(paramName, event.target.value);
      window.location.href = url.toString();
    });
  });

  // Helper JSON fetch
  async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }
    return data;
  }

  // Sport Enrollment Toggle (Explore Sports & Student Dashboard)
  document.querySelectorAll("[data-enroll-btn]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const studentId = btn.dataset.studentId;
      const sportId = btn.dataset.sportId;
      btn.disabled = true;
      try {
        const data = await apiRequest("/api/enroll", {
          method: "POST",
          body: JSON.stringify({ studentId, sportId })
        });
        showToast(
          data.enrolled
            ? `Enrolled in ${data.sport.name}.`
            : `Removed from ${data.sport.name} roster.`
        );
        setTimeout(() => window.location.reload(), 450);
      } catch (err) {
        showToast(err.message);
        btn.disabled = false;
      }
    });
  });

  // View Sport Roster Modal
  const rosterModal = document.getElementById("sport-roster-modal");
  const rosterTitle = document.getElementById("roster-modal-title");
  const rosterMeta = document.getElementById("roster-modal-meta");
  const rosterBody = document.getElementById("roster-modal-body");

  document.querySelectorAll("[data-view-sport-roster]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const sportId = btn.dataset.viewSportRoster;
      try {
        const { sport, roster } = await apiRequest(`/api/sports/${sportId}`);
        rosterMeta.textContent = `${sport.category} · ${sport.coach} · ${sport.venue}`;
        rosterTitle.textContent = `${sport.name} Roster (${roster.length}/${sport.maxRoster})`;
        if (roster.length === 0) {
          rosterBody.innerHTML = '<p class="text-slate-400 py-4">No student-athletes enrolled in this program yet.</p>';
        } else {
          rosterBody.innerHTML = roster
            .map(
              (stu) => `
              <div class="flex items-center justify-between gap-4 rounded-lg border border-slate-400/15 bg-[#060B16] px-4 py-3">
                <div>
                  <a href="/student/profile?id=${stu.id}" class="font-semibold text-white hover:text-blue-400">${stu.name}</a>
                  <p class="text-xs text-slate-400">${stu.department} · ${stu.year} · ${stu.position}</p>
                </div>
                <span class="font-mono text-xs text-blue-400 tabular-nums">#${stu.jersey} · ${stu.points} pts</span>
              </div>`
            )
            .join("");
        }
        rosterModal.classList.remove("hidden");
        rosterModal.classList.add("flex");
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  document.querySelectorAll("[data-close-roster-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      rosterModal.classList.add("hidden");
      rosterModal.classList.remove("flex");
    });
  });

  // Explore Sports Client Filtering
  const sportCards = Array.from(document.querySelectorAll("[data-sport-card]"));
  const sportsSearchInput = document.getElementById("sports-search");
  const sportsEmptyState = document.getElementById("sports-empty-state");
  let activeCategory = "All";

  function filterSports() {
    if (sportCards.length === 0) return;
    const query = (sportsSearchInput?.value || "").trim().toLowerCase();
    let visible = 0;
    sportCards.forEach((card) => {
      const matchesCat = activeCategory === "All" || card.dataset.category === activeCategory;
      const matchesSearch = !query || card.dataset.search.includes(query);
      const show = matchesCat && matchesSearch;
      card.classList.toggle("hidden", !show);
      if (show) visible += 1;
    });
    if (sportsEmptyState) {
      sportsEmptyState.classList.toggle("hidden", visible > 0);
    }
  }

  document.querySelectorAll("[data-category-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.categoryFilter;
      document.querySelectorAll("[data-category-filter]").forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle("bg-blue-600", isActive);
        b.classList.toggle("text-white", isActive);
        b.classList.toggle("text-slate-300", !isActive);
      });
      filterSports();
    });
  });

  if (sportsSearchInput) {
    sportsSearchInput.addEventListener("input", filterSports);
  }

  // Student Dashboard Performance Split Form
  const perfLogForm = document.getElementById("performance-log-form");
  if (perfLogForm) {
    perfLogForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const studentId = perfLogForm.dataset.studentId;
      const formData = new FormData(perfLogForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        await apiRequest(`/api/students/${studentId}/logs`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        showToast("Performance split logged (+8 season points).");
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        showToast(err.message);
      }
    });
  }

  // Student Profile Edit Form
  const profileForm = document.getElementById("student-profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const studentId = profileForm.dataset.studentId;
      const formData = new FormData(profileForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        await apiRequest(`/api/students/${studentId}`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        showToast("Athlete profile updated.");
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        showToast(err.message);
      }
    });
  }

  // Matches & Fixtures Filtering
  const fixtureRows = Array.from(document.querySelectorAll("[data-fixture-row]"));
  const fixtureSportSelect = document.getElementById("fixture-sport-filter");
  const fixtureSearchInput = document.getElementById("fixture-search");
  const fixturesEmptyState = document.getElementById("fixtures-empty-state");
  let activeFixtureStatus = "all";

  function filterFixtures() {
    if (fixtureRows.length === 0) return;
    const sportVal = fixtureSportSelect?.value || "all";
    const query = (fixtureSearchInput?.value || "").trim().toLowerCase();
    let visible = 0;
    fixtureRows.forEach((row) => {
      const matchSport = sportVal === "all" || row.dataset.sportId === sportVal;
      const matchStatus = activeFixtureStatus === "all" || row.dataset.status === activeFixtureStatus;
      const matchQuery = !query || row.dataset.search.includes(query);
      const show = matchSport && matchStatus && matchQuery;
      row.classList.toggle("hidden", !show);
      if (show) visible += 1;
    });
    if (fixturesEmptyState) fixturesEmptyState.classList.toggle("hidden", visible > 0);
  }

  document.querySelectorAll("[data-fixture-status]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFixtureStatus = btn.dataset.fixtureStatus;
      document.querySelectorAll("[data-fixture-status]").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("bg-blue-600", active);
        b.classList.toggle("text-white", active);
        b.classList.toggle("text-slate-300", !active);
      });
      filterFixtures();
    });
  });
  if (fixtureSportSelect) fixtureSportSelect.addEventListener("change", filterFixtures);
  if (fixtureSearchInput) fixtureSearchInput.addEventListener("input", filterFixtures);

  // Match Results Filtering
  const resultRows = Array.from(document.querySelectorAll("[data-result-row]"));
  const resultSportSelect = document.getElementById("result-sport-filter");
  const resultSearchInput = document.getElementById("result-search");
  const resultsEmptyState = document.getElementById("results-empty-state");
  let activeResultOutcome = "all";

  function filterResults() {
    if (resultRows.length === 0) return;
    const sportVal = resultSportSelect?.value || "all";
    const query = (resultSearchInput?.value || "").trim().toLowerCase();
    let visible = 0;
    resultRows.forEach((row) => {
      const matchSport = sportVal === "all" || row.dataset.sportId === sportVal;
      const matchOutcome = activeResultOutcome === "all" || row.dataset.outcome === activeResultOutcome;
      const matchQuery = !query || row.dataset.search.includes(query);
      const show = matchSport && matchOutcome && matchQuery;
      row.classList.toggle("hidden", !show);
      if (show) visible += 1;
    });
    if (resultsEmptyState) resultsEmptyState.classList.toggle("hidden", visible > 0);
  }

  document.querySelectorAll("[data-result-outcome]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeResultOutcome = btn.dataset.resultOutcome;
      document.querySelectorAll("[data-result-outcome]").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("bg-blue-600", active);
        b.classList.toggle("text-white", active);
        b.classList.toggle("text-slate-300", !active);
      });
      filterResults();
    });
  });
  if (resultSportSelect) resultSportSelect.addEventListener("change", filterResults);
  if (resultSearchInput) resultSearchInput.addEventListener("input", filterResults);

  // Leaderboard Tabs
  const lbAthletesPanel = document.getElementById("lb-panel-athletes");
  const lbProgramsPanel = document.getElementById("lb-panel-programs");
  document.querySelectorAll("[data-lb-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.lbTab;
      document.querySelectorAll("[data-lb-tab]").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("bg-blue-600", active);
        b.classList.toggle("text-white", active);
        b.classList.toggle("text-slate-300", !active);
      });
      if (lbAthletesPanel && lbProgramsPanel) {
        lbAthletesPanel.classList.toggle("hidden", tab !== "athletes");
        lbProgramsPanel.classList.toggle("hidden", tab !== "programs");
      }
    });
  });

  // Admin: Manage Students Filtering & CRUD
  const adminStudentRows = Array.from(document.querySelectorAll("[data-admin-student-row]"));
  const adminStuSearch = document.getElementById("admin-student-search");
  const adminStuSport = document.getElementById("admin-student-sport-filter");

  function filterAdminStudents() {
    if (adminStudentRows.length === 0) return;
    const query = (adminStuSearch?.value || "").trim().toLowerCase();
    const sportVal = adminStuSport?.value || "all";
    adminStudentRows.forEach((row) => {
      const mSport = sportVal === "all" || row.dataset.sportId === sportVal;
      const mQuery = !query || row.dataset.search.includes(query);
      row.classList.toggle("hidden", !(mSport && mQuery));
    });
  }
  if (adminStuSearch) adminStuSearch.addEventListener("input", filterAdminStudents);
  if (adminStuSport) adminStuSport.addEventListener("change", filterAdminStudents);

  const studentModal = document.getElementById("admin-student-modal");
  const studentModalTitle = document.getElementById("student-modal-title");
  const studentForm = document.getElementById("admin-student-form");

  document.querySelectorAll("[data-open-student-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!studentForm || !studentModal) return;
      studentForm.reset();
      document.getElementById("stu-form-id").value = "";
      studentModalTitle.textContent = "Add Student-Athlete";
      studentModal.classList.remove("hidden");
      studentModal.classList.add("flex");
    });
  });

  document.querySelectorAll("[data-edit-student]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!studentForm || !studentModal) return;
      const stu = JSON.parse(btn.dataset.editStudent);
      document.getElementById("stu-form-id").value = stu.id;
      document.getElementById("stu-form-name").value = stu.name;
      document.getElementById("stu-form-email").value = stu.email;
      document.getElementById("stu-form-dept").value = stu.department;
      document.getElementById("stu-form-year").value = stu.year;
      document.getElementById("stu-form-jersey").value = stu.jersey;
      document.getElementById("stu-form-sport").value = stu.primarySportId;
      document.getElementById("stu-form-position").value = stu.position;
      document.getElementById("stu-form-pb").value = stu.personalBest;
      studentModalTitle.textContent = `Edit ${stu.name}`;
      studentModal.classList.remove("hidden");
      studentModal.classList.add("flex");
    });
  });

  document.querySelectorAll("[data-close-student-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      studentModal.classList.add("hidden");
      studentModal.classList.remove("flex");
    });
  });

  if (studentForm) {
    studentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(studentForm).entries());
      const id = payload.id;
      try {
        if (id) {
          await apiRequest(`/api/students/${id}`, { method: "POST", body: JSON.stringify(payload) });
          showToast("Student record updated.");
        } else {
          await apiRequest("/api/students", { method: "POST", body: JSON.stringify(payload) });
          showToast("New student-athlete added.");
        }
        setTimeout(() => window.location.reload(), 450);
      } catch (err) {
        showToast(err.message);
      }
    });
  }

  document.querySelectorAll("[data-delete-student]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.deleteStudent;
      const name = btn.dataset.studentName;
      const confirmed = await openConfirmDialog(`Remove ${name} from the college athletics roster? This action cannot be undone.`);
      if (!confirmed) return;
      try {
        await apiRequest(`/api/students/${id}`, { method: "DELETE" });
        showToast(`${name} removed from roster.`);
        setTimeout(() => window.location.reload(), 450);
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  // Admin: Manage Sports & Matches Tabs + CRUD
  const adminMatchesPanel = document.getElementById("admin-panel-matches");
  const adminSportsPanel = document.getElementById("admin-panel-sports");
  document.querySelectorAll("[data-admin-sm-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.adminSmTab;
      document.querySelectorAll("[data-admin-sm-tab]").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("bg-blue-600", active);
        b.classList.toggle("text-white", active);
        b.classList.toggle("text-slate-300", !active);
      });
      if (adminMatchesPanel && adminSportsPanel) {
        adminMatchesPanel.classList.toggle("hidden", tab !== "matches");
        adminSportsPanel.classList.toggle("hidden", tab !== "sports");
      }
    });
  });

  // Sport Modal
  const sportModal = document.getElementById("admin-sport-modal");
  const sportForm = document.getElementById("admin-sport-form");
  document.querySelectorAll("[data-open-sport-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      sportModal.classList.remove("hidden");
      sportModal.classList.add("flex");
    });
  });
  document.querySelectorAll("[data-close-sport-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      sportModal.classList.add("hidden");
      sportModal.classList.remove("flex");
    });
  });
  if (sportForm) {
    sportForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(sportForm).entries());
      try {
        await apiRequest("/api/sports", { method: "POST", body: JSON.stringify(payload) });
        showToast("Varsity sport program created.");
        setTimeout(() => window.location.reload(), 450);
      } catch (err) {
        showToast(err.message);
      }
    });
  }

  document.querySelectorAll("[data-toggle-sport-status]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.toggleSportStatus;
      const status = btn.dataset.nextStatus;
      try {
        await apiRequest(`/api/sports/${id}`, { method: "POST", body: JSON.stringify({ status }) });
        showToast(`Program status updated to ${status}.`);
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  document.querySelectorAll("[data-delete-sport]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.deleteSport;
      const name = btn.dataset.sportName;
      const confirmed = await openConfirmDialog(`Delete ${name} and all associated scheduled fixtures?`);
      if (!confirmed) return;
      try {
        await apiRequest(`/api/sports/${id}`, { method: "DELETE" });
        showToast(`${name} deleted.`);
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  // Schedule Match Modal
  const matchModal = document.getElementById("admin-match-modal");
  const matchForm = document.getElementById("admin-match-form");
  document.querySelectorAll("[data-open-match-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      matchModal.classList.remove("hidden");
      matchModal.classList.add("flex");
    });
  });
  document.querySelectorAll("[data-close-match-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      matchModal.classList.add("hidden");
      matchModal.classList.remove("flex");
    });
  });
  if (matchForm) {
    matchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(matchForm).entries());
      try {
        await apiRequest("/api/matches", { method: "POST", body: JSON.stringify(payload) });
        showToast("Fixture scheduled.");
        setTimeout(() => window.location.reload(), 450);
      } catch (err) {
        showToast(err.message);
      }
    });
  }

  // Record Match Result Modal
  const resultModal = document.getElementById("admin-result-modal");
  const resultForm = document.getElementById("admin-result-form");
  document.querySelectorAll("[data-record-result]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const m = JSON.parse(btn.dataset.recordResult);
      document.getElementById("res-match-id").value = m.id;
      document.getElementById("res-match-label").textContent = m.title;
      document.getElementById("res-home-label").textContent = `${m.homeTeam} Score`;
      document.getElementById("res-away-label").textContent = `${m.awayTeam} Score`;
      resultModal.classList.remove("hidden");
      resultModal.classList.add("flex");
    });
  });
  document.querySelectorAll("[data-close-result-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      resultModal.classList.add("hidden");
      resultModal.classList.remove("flex");
    });
  });
  if (resultForm) {
    resultForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(resultForm).entries());
      try {
        await apiRequest(`/api/matches/${payload.matchId}/result`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        showToast("Final score published & standings updated.");
        setTimeout(() => window.location.reload(), 450);
      } catch (err) {
        showToast(err.message);
      }
    });
  }

  document.querySelectorAll("[data-delete-match]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.deleteMatch;
      const title = btn.dataset.matchTitle;
      const confirmed = await openConfirmDialog(`Delete match "${title}"?`);
      if (!confirmed) return;
      try {
        await apiRequest(`/api/matches/${id}`, { method: "DELETE" });
        showToast("Match removed.");
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  // Escape key closes active modals
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    [confirmModal, rosterModal, studentModal, sportModal, matchModal, resultModal].forEach((m) => {
      if (m && !m.classList.contains("hidden")) {
        m.classList.add("hidden");
        m.classList.remove("flex");
      }
    });
  });
})();
