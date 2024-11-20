function createTable() {
  const table = document.getElementById("resizable-table");
  const headers = table.querySelectorAll("th");
  let draggingCol = null;
  let startX, startWidth;
  let draggedHeader = null;

  headers.forEach((header) => {
    if (header.closest(".select-th")) {
      return;
    }

    // Sorting event
    header.addEventListener("click", (e) => {
      sortingHandler(e, header.dataset.id);
    });

    // Set default width for columns
    header.style.width = `${header.offsetWidth}px`;

    // Resizing logic
    const resizer = header.querySelector(".resizer");
    if (resizer) {
      resizer.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        e.preventDefault();

        headers.forEach((header) => {
          header.style.width = `${header.offsetWidth}px`;
        });

        table.style.width = "fit-content";

        draggingCol = header;
        startX = e.pageX;
        startWidth = header.offsetWidth;

        document.addEventListener("mousemove", onResize);
        document.addEventListener("mouseup", stopResize);

        table.classList.add("resizing");
      });
    }

    // Column moving functionality
    const handle = header.querySelector(".handle");
    handle?.addEventListener("mousedown", function (e) {
      draggedHeader = header;
      header.classList.add("dragging");

      document.querySelector("table").classList.add("prevent-select");

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", stopMove);
    });
  });

  // ReSizing functions

  function onResize(e) {
    if (draggingCol) {
      // Calculate the difference from the starting point
      const diffX = e.pageX - startX;
      // For RTL, we need to invert the difference
      const newWidth = Math.max(startWidth - diffX, 150); // Minimum width of 100px
      draggingCol.style.width = `${newWidth}px`;
    }
  }

  function stopResize() {
    // TODO: make request when resize {id: string, size: string}
    console.log(draggingCol.dataset.id, draggingCol.style.width);
    localStorage.setItem(
      `size-${draggingCol.dataset.id}`,
      draggingCol.style.width
    );

    draggingCol = null;
    table.classList.remove("resizing");
    document.removeEventListener("mousemove", onResize);
    document.removeEventListener("mouseup", stopResize);
  }

  // Reordering functions

  function onMove(e) {
    e.preventDefault();
    headers.forEach((header) => {
      if (header !== draggedHeader) {
        const rect = header.getBoundingClientRect();
        const min = rect.x;
        const max = rect.x + rect.width;

        header.classList.toggle(
          "drag-over",
          e.clientX < max && e.clientX > min
        );
      }
    });
  }

  function stopMove() {
    document.querySelector("table").classList.remove("prevent-select");

    if (draggedHeader) {
      const dragOverHeader = table.querySelector("th.drag-over");
      if (dragOverHeader) {
        // TODO: make request when drag end {id: string, target-id: string}
        console.log(draggedHeader.dataset.id, dragOverHeader.dataset.id);
        // id = draggedHeader.dataset.id
        // target-id = dragOverHeader.dataset.id
      }

      draggedHeader.classList.remove("dragging");
      headers.forEach((header) => header.classList.remove("drag-over"));
      draggedHeader = null;
    }

    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", stopMove);
  }

  // Sorting functions

  function sortingHandler(e, id) {
    // Ignore click if it's on handle, resizer, filter-badge, select-th, menu
    if (
      e.target.classList.contains("handle") ||
      e.target.classList.contains("resizer") ||
      e.target.classList.contains("column-menu-button") ||
      e.target.closest(".column-menu") ||
      e.target.classList.contains("filter-badge") ||
      e.target.closest(".select-th")
    ) {
      return;
    }

    // TODO: make request when sort {id: string}
    console.log(id);
    // id = header.dataset.id

    localStorage.setItem(`sort-${id}`, "asc"); // asc , desc , default
  }

  // Menu

  function initializeMenus() {
    const menuButtons = table.querySelectorAll(".column-menu-button");

    // Close menu when click outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".column-menu-button")) {
        table.querySelectorAll(".column-menu.show").forEach((menu) => {
          menu.classList.remove("show");
        });
      }
    });

    menuButtons.forEach((button, index) => {
      const menu = button.parentElement.querySelector(".column-menu");
      const submenuItems = button.parentElement.querySelectorAll(
        ".submenu label input"
      );
      const header = button.parentElement.parentElement;
      console.log(header);

      if (!header.dataset.id) return;

      // Open menu and close other menus when click menu button
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        table.querySelectorAll(".column-menu.show").forEach((m) => {
          if (m !== menu) m.classList.remove("show");
        });
        menu.classList.toggle("show");
      });

      menu.addEventListener("click", (e) => e.stopPropagation());

      // Hide column event
      const hideButton = menu.querySelector(".hide-column");
      hideButton.addEventListener("click", (e) => {
        e.stopPropagation();
        changeColumnVisibility(header.dataset.id);
      });

      // Submenu items event
      submenuItems.forEach((item) => {
        item.addEventListener("change", (e) => {
          e.stopPropagation();
          changeColumnVisibility(item.parentElement.parentElement.dataset.id);
        });
      });
    });
  }

  // Change visibility functions

  function changeColumnVisibility(id) {
    // TODO: make request when change column visibility {id: string}
    console.log(id);
  }

  // Filtering functions

  function initializeFilters() {
    const filterContainers = table.querySelectorAll(".filter-container");
    const filterBadges = document.querySelectorAll(".filter-badge");

    filterContainers.forEach((container) => {
      const select = container.querySelector(".filter-select");
      const input = container.querySelector(".filter-input");
      const applyButton = container.querySelector(".apply-filter");
      const clearButton = container.querySelector(".clear-filter");

      applyButton.addEventListener("click", (e) => {
        const filterType = select.value;
        const filterValue = input.value;

        const header =
          applyButton.parentElement.parentElement.parentElement.parentElement
            .parentElement.parentElement;

        console.log(header);

        if (!filterValue) {
          clearFilter(header.dataset.id);

          return;
        }

        applyFilter(header.dataset.id, filterType, filterValue);

        // Hide menu after applying filter
        container.closest(".column-menu").classList.remove("show");
      });

      clearButton.addEventListener("click", (e) => {
        const header =
          clearButton.parentElement.parentElement.parentElement.parentElement
            .parentElement.parentElement;

        clearFilter(header.dataset.id);

        container.closest(".column-menu").classList.remove("show");
      });

      // Add input shortcuts
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          applyButton.click();
        }
      });
    });

    filterBadges.forEach((badge) => {
      badge.addEventListener("click", () => {
        const header = badge.target.parentElement.parentElement;

        clearFilter(header.dataset.id);
      });
    });
  }

  function applyFilter(id, filterType, filterValue) {
    // TODO: make request when apply filter {id: string, type: filterType,value: filterValue}
    console.log(id, filterType, filterValue);

    localStorage.setItem(`filter-${id}`, {
      type: filterType,
      value: filterValue,
    });
  }

  function clearFilter(id) {
    // TODO: make request when remove filter {id: string}
    console.log(id);

    localStorage.removeItem(`filter-${id}`);
  }

  function clearAllFilters() {
    // TODO: make request when remove all filter
    console.log("all cleared");
  }

  // Grouping functions

  function initializeGrouping() {
    const groupByButton = document.querySelectorAll(".menu-item.group-by");
    const groupedItems = document.querySelectorAll(
      ".grouped-container .grouped-item"
    );

    groupByButton.forEach((btn) => {
      btn.addEventListener("click", () => {
        const header = btn.parentElement.parentElement.parentElement;

        addGrouping(header.dataset.id);
      });
    });

    groupedItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        sortingHandler(event, item.dataset.id);
      });

      item
        .querySelector(".remove-group-button")
        .addEventListener("click", (event) => {
          event.stopPropagation();
          removeGrouping(item.dataset.id);
        });
    });
  }

  function addGrouping(id) {
    // TODO: make request when add grouping {id: string}

    console.log(id);
  }

  function removeGrouping(id) {
    // TODO: make request when remove grouping {id: string}

    console.log(id);
  }

  // Selection

  function initializeSelection() {
    const selectAllButton = document.querySelector("table .select-th input");
    const selectButtons = document.querySelectorAll("table .select-td input");

    selectAllButton.addEventListener("click", (event) => {
      console.log("first");
      if (selectAllButton.checked) {
        selectButtons.forEach((btn) => {
          btn.checked = true;
        });
      } else {
        selectButtons.forEach((btn) => {
          btn.checked = false;
        });
      }
    });

    selectButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        console.log("first1");
        if (btn.checked) {
          let isAllSelected = true;

          selectButtons.forEach((selectBtn) => {
            if (!selectBtn.checked) isAllSelected = false;
          });

          if (isAllSelected) selectAllButton.checked = true;
        } else {
          selectAllButton.checked = false;
        }
      });
    });
  }

  initializeSelection();
  initializeMenus();
  initializeFilters();
  initializeGrouping();
}

document.addEventListener("DOMContentLoaded", () => {
  createTable();
});
