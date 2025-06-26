import jsPDF from "jspdf";

export const generateCertificate = (
  documentHash,
  notary,
  notarizationTime,
  expirationTime
) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Notarization Certificate", 105, 20, null, null, "center");

  doc.setFontSize(12);
  doc.text(`Document Hash: ${documentHash}`, 20, 40);
  doc.text(`Notary Address: ${notary}`, 20, 50);
  doc.text(
    `Notarization Time: ${new Date(notarizationTime * 1000).toLocaleString()}`,
    20,
    60
  );
  doc.text(
    `Expiration Time: ${new Date(expirationTime * 1000).toLocaleString()}`,
    20,
    70
  );

  doc.text(
    "This certificate verifies that the above document has been notarized on the blockchain.",
    20,
    90
  );

  doc.save(`Notarization_Certificate_${documentHash}.pdf`);
};
