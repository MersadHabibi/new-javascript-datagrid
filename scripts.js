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
      sortingHandler(e, header);
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
    console.log(draggingCol.dataset.id);

    // TODO: make request when resize {id: string, size: string}
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
        console.log(draggedHeader.dataset.id, dragOverHeader.dataset.id);
        // TODO: make request when drag end {id: string, target-id: string}
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

  function sortingHandler(e, header) {
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
    // id = header.dataset.id

    localStorage.setItem(`sort-${header.dataset.id}`, "asc"); // asc , desc , default
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
    console.log(id);
    // TODO: make request when change column visibility {id: string}
  }

  // Filtering functions

  function initializeFilters() {
    const filterContainers = table.querySelectorAll(".filter-container");

    filterContainers.forEach((container) => {
      const select = container.querySelector(".filter-select");
      const input = container.querySelector(".filter-input");
      const applyButton = container.querySelector(".apply-filter");
      const clearButton = container.querySelector(".clear-filter");

      applyButton.addEventListener("click", (e) => {
        const filterType = select.value;
        const filterValue = input.value;

        const header =
          e.target.parentElement.parentElement.parentElement.parentElement
            .parentElement.parentElement;

        if (!filterValue) {
          clearFilter(header.dataset.id);
        }

        applyFilter(header.dataset.id, filterType, filterValue);

        // Hide menu after applying filter
        container.closest(".column-menu").classList.remove("show");
      });

      clearButton.addEventListener("click", () => {
        const header =
          e.target.parentElement.parentElement.parentElement.parentElement
            .parentElement.parentElement;

        clearFilter(header.dataset.id);
      });

      // Add input shortcuts
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          applyButton.click();
        }
      });
    });
  }

  function applyFilter(id, filterType, filterValue) {
    // TODO: make request when apply filter {id: string, type: filterType,value: filterValue}

    localStorage.setItem(`filter-${id}`, {
      type: filterType,
      value: filterValue,
    });
  }

  function clearFilter(id) {
    // TODO: make request when remove filter {id: string}

    localStorage.removeItem(`filter-${id}`);
  }

  initializeMenus();
  initializeFilters();
}

document.addEventListener("DOMContentLoaded", () => {
  createTable();
});
