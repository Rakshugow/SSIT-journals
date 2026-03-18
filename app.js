function toggleVisibility(element, show) {
  if (!element) {
    return;
  }

  element.classList.toggle("hidden", !show);
}

function syncRequiredFields(form) {
  const conditionalFields = form.querySelectorAll("[data-required='true']");

  conditionalFields.forEach((field) => {
    field.required = !field.closest(".hidden");
  });
}

function clearHiddenFields(container) {
  if (!container) {
    return;
  }

  const inputs = container.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    if (input.tagName === "SELECT") {
      input.selectedIndex = 0;
    } else if (input.type === "file") {
      input.value = "";
    } else if (input.type !== "button" && input.type !== "submit" && input.type !== "reset") {
      input.value = "";
    }
  });
}

function showPublicationBlock(form, publicationType) {
  const conferenceBlock = form.querySelector('[data-block="conference"]');
  const journalBlock = form.querySelector('[data-block="journal"]');

  toggleVisibility(conferenceBlock, publicationType === "conference");
  toggleVisibility(journalBlock, publicationType === "journal");

  if (publicationType !== "conference") {
    clearHiddenFields(conferenceBlock);
  }

  if (publicationType !== "journal") {
    clearHiddenFields(journalBlock);
  }

  syncRequiredFields(form);
}

function showScopedBlock(form, scopeName, scopeValue) {
  const mapping = {
    conferenceScope: {
      national: '[data-block="conference-national"]',
      international: '[data-block="conference-international"]',
    },
    journalScope: {
      national: '[data-block="journal-national"]',
      international: '[data-block="journal-international"]',
    },
  };

  const config = mapping[scopeName];

  if (!config) {
    return;
  }

  Object.entries(config).forEach(([key, selector]) => {
    const block = form.querySelector(selector);
    const show = key === scopeValue;

    toggleVisibility(block, show);

    if (!show) {
      clearHiddenFields(block);
    }
  });

  syncRequiredFields(form);
}

function showIndexingExtras(form, selectName, selectValue) {
  const mapping = {
    conferenceIndexedBy: {
      scopus: '[data-block="conference-scopus"]',
      other: '[data-block="conference-other-index"]',
    },
    journalIndexedBy: {
      scopus: '[data-block="journal-scopus"]',
      other: '[data-block="journal-other-index"]',
    },
  };

  const config = mapping[selectName];

  if (!config) {
    return;
  }

  Object.entries(config).forEach(([key, selector]) => {
    const block = form.querySelector(selector);
    const show = key === selectValue;

    toggleVisibility(block, show);

    if (!show) {
      clearHiddenFields(block);
    }
  });

  syncRequiredFields(form);
}

function validatePdfInputs(form) {
  const fileInputs = form.querySelectorAll('input[type="file"]');

  for (const input of fileInputs) {
    const file = input.files[0];

    if (!file) {
      continue;
    }

    const isPdfType = file.type === "application/pdf";
    const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");

    if (!isPdfType && !hasPdfExtension) {
      return {
        valid: false,
        message: "Please upload PDF files only for certificate or paper uploads.",
      };
    }
  }

  return { valid: true, message: "" };
}

function initializeForm(form) {
  const publicationType = form.querySelector('[name="publicationType"]');
  const conferenceScope = form.querySelector('[name="conferenceScope"]');
  const journalScope = form.querySelector('[name="journalScope"]');
  const conferenceIndexedBy = form.querySelector('[name="conferenceIndexedBy"]');
  const journalIndexedBy = form.querySelector('[name="journalIndexedBy"]');
  const status = form.querySelector(".form-status");

  publicationType?.addEventListener("change", (event) => {
    showPublicationBlock(form, event.target.value);
  });

  conferenceScope?.addEventListener("change", (event) => {
    showScopedBlock(form, "conferenceScope", event.target.value);
  });

  journalScope?.addEventListener("change", (event) => {
    showScopedBlock(form, "journalScope", event.target.value);
  });

  conferenceIndexedBy?.addEventListener("change", (event) => {
    showIndexingExtras(form, "conferenceIndexedBy", event.target.value);
  });

  journalIndexedBy?.addEventListener("change", (event) => {
    showIndexingExtras(form, "journalIndexedBy", event.target.value);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";

    if (!form.reportValidity()) {
      status.textContent = "Please fill in the required fields before submitting.";
      return;
    }

    const pdfValidation = validatePdfInputs(form);

    if (!pdfValidation.valid) {
      status.textContent = pdfValidation.message;
      return;
    }

    status.textContent = "Form is ready and validated successfully. You can now connect this page to a backend or database.";
  });

  showPublicationBlock(form, publicationType?.value || "");
  showScopedBlock(form, "conferenceScope", conferenceScope?.value || "");
  showScopedBlock(form, "journalScope", journalScope?.value || "");
  showIndexingExtras(form, "conferenceIndexedBy", conferenceIndexedBy?.value || "");
  showIndexingExtras(form, "journalIndexedBy", journalIndexedBy?.value || "");
  syncRequiredFields(form);
}

document.querySelectorAll(".publication-form").forEach(initializeForm);
