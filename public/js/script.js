// Initialize all Materialize components
document.addEventListener("DOMContentLoaded", function () {
  // Initialize mobile sidebar navigation
  const sidenavElems = document.querySelectorAll(".sidenav");
  M.Sidenav.init(sidenavElems);

  // Initialize dropdowns
  const dropdownElems = document.querySelectorAll(".dropdown-trigger");
  M.Dropdown.init(dropdownElems, {
    coverTrigger: false,
    constrainWidth: false,
  });

  // Initialize select inputs
  const selectElems = document.querySelectorAll("select");
  M.FormSelect.init(selectElems);

  // Initialize modals
  const modalElems = document.querySelectorAll(".modal");
  M.Modal.init(modalElems);

  // Initialize tooltips
  const tooltipElems = document.querySelectorAll(".tooltipped");
  M.Tooltip.init(tooltipElems);

  // Initialize datepicker if available on the page
  const datepickerElems = document.querySelectorAll(".datepicker");
  if (datepickerElems.length > 0) {
    M.Datepicker.init(datepickerElems, {
      format: "yyyy-mm-dd",
      minDate: new Date(), // Can't book appointments in the past
      autoClose: true,
    });
  }

  // Initialize timepicker if available on the page
  const timepickerElems = document.querySelectorAll(".timepicker");
  if (timepickerElems.length > 0) {
    M.Timepicker.init(timepickerElems, {
      defaultTime: "10:00",
      twelveHour: false,
      autoClose: true,
    });
  }

  // Initialize tabs if available on the page
  const tabsElems = document.querySelectorAll(".tabs");
  if (tabsElems.length > 0) {
    M.Tabs.init(tabsElems);
  }

  // Initialize collapsibles if available on the page
  const collapsibleElems = document.querySelectorAll(".collapsible");
  if (collapsibleElems.length > 0) {
    M.Collapsible.init(collapsibleElems);
  }

  // Initialize parallax if available on the page
  const parallaxElems = document.querySelectorAll(".parallax");
  if (parallaxElems.length > 0) {
    M.Parallax.init(parallaxElems);
  }
});

// Function to show toast messages
function showToast(message, classes = "rounded") {
  M.toast({ html: message, classes: classes });
}

// Function to format dates for display
function formatDate(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleString("en-US", options);
}

// Function to confirm deletes
function confirmDelete(formId) {
  if (
    confirm(
      "Are you sure you want to delete this item? This action cannot be undone."
    )
  ) {
    document.getElementById(formId).submit();
  }
}

// Function to validate password matching for registration
function validatePassword() {
  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;
  const passwordMsg = document.getElementById("password-message");

  if (password2 && password !== password2) {
    passwordMsg.textContent = "Passwords do not match";
    passwordMsg.className = "red-text";
    return false;
  } else if (password2) {
    passwordMsg.textContent = "Passwords match";
    passwordMsg.className = "green-text";
  } else {
    passwordMsg.textContent = "";
  }
  return true;
}

// If password fields exist, add event listeners
document.addEventListener("DOMContentLoaded", function () {
  const password2Field = document.getElementById("password2");
  if (password2Field) {
    password2Field.addEventListener("input", validatePassword);
  }

  // Form submission validation
  const registerForm = document.querySelector('form[action="/users/register"]');
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      if (!validatePassword()) {
        e.preventDefault();
        showToast("Passwords do not match", "red rounded");
      }
    });
  }
});
