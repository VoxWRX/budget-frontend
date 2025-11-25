// src/utils/csvHelper.js

/**
 * Convertit un tableau d'objets en chaîne CSV
 */
const convertToCSV = (data, headers, keys) => {
  const separator = ",";

  const csvRows = [headers.join(separator)];

  for (const row of data) {
    const values = keys.map((key) => {
      // CORRECTION BUG DU ZÉRO : On vérifie si c'est null/undefined, pas juste "falsy"
      const rawValue = row[key] ?? "";

      // CORRECTION S7781 : replaceAll est utilisé ici
      const val = String(rawValue).replaceAll('"', '""');

      return `"${val}"`;
    });
    csvRows.push(values.join(separator));
  }

  return csvRows.join("\n");
};

/**
 * Déclenche le téléchargement
 */
export const downloadCSV = (filename, csvContent) => {
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);

  document.body.appendChild(link);
  link.click();

  // CORRECTION S7762 : remove() direct
  link.remove();

  URL.revokeObjectURL(url);
};

export const generateTransactionsCSV = (
  transactions,
  categories,
  budgetName,
  currency
) => {
  const headers = [
    "Date",
    "Type",
    "Catégorie",
    "Description",
    "Montant",
    "Devise",
  ];

  const flatData = transactions.map((tx) => {
    const category = categories.find((c) => c.id === tx.category_id);
    return {
      date: new Date(tx.transaction_date).toLocaleDateString(),
      type: tx.type === "income" ? "Revenu" : "Dépense",
      category: category ? category.name : "-",
      description: tx.description,
      amount: tx.amount,
      // CORRECTION : On utilise la variable passée en paramètre (ou EUR par défaut)
      currency: currency || "EUR",
    };
  });

  const csvString = convertToCSV(flatData, headers, [
    "date",
    "type",
    "category",
    "description",
    "amount",
    "currency",
  ]);

  const safeName = budgetName.replaceAll(/[^a-z0-9]/gi, "_").toLowerCase();
  const fileName = `Export_${safeName}_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  downloadCSV(fileName, csvString);
};
