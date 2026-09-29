import PDFDocument from 'pdfkit';
import { config } from '../config.js';
import type { Material } from '../content/materials.js';

const BRAND = '#16a34a';
const INK = '#0f172a';
const MUTED = '#475569';

function toBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) doc.addPage();
}

/** Gera o PDF de um material de apoio, com marca d'água do aluno em cada página. */
export function renderMaterial(material: Material, ownerEmail: string): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 56, info: { Title: material.title, Author: config.productName } });
  const width = doc.page.width - 112;

  const stamp = () => {
    const { x, y } = { x: doc.x, y: doc.y };
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0; // escreve no rodapé sem disparar nova página
    doc.save().fontSize(8).fillColor('#94a3b8')
      .text(`Licenciado para ${ownerEmail} · ${config.productName}`, 56, doc.page.height - 40, { width, align: 'center', lineBreak: false })
      .restore();
    doc.page.margins.bottom = bottom;
    doc.x = x;
    doc.y = y;
  };
  stamp();
  doc.on('pageAdded', stamp);

  doc.rect(0, 0, doc.page.width, 8).fill(BRAND);
  doc.moveDown(1);
  doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(10).text(material.subtitle.toUpperCase(), { characterSpacing: 1 });
  doc.moveDown(0.3);
  doc.fillColor(INK).fontSize(22).text(material.title);
  doc.moveDown(1);

  for (const section of material.sections) {
    ensureSpace(doc, 80);
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(14).text(section.heading);
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(11).fillColor(MUTED);

    for (const p of section.paragraphs ?? []) {
      doc.text(p, { width, lineGap: 3 });
      doc.moveDown(0.5);
    }
    for (const b of section.bullets ?? []) {
      ensureSpace(doc, 30);
      doc.fillColor(BRAND).text('•  ', { continued: true }).fillColor(MUTED).text(b, { width, lineGap: 2 });
      doc.moveDown(0.3);
    }
    for (const c of section.checklist ?? []) {
      ensureSpace(doc, 24);
      const y = doc.y;
      doc.rect(56, y + 1, 10, 10).lineWidth(1).stroke(BRAND);
      doc.fillColor(MUTED).text(c, 74, y, { width: width - 18, lineGap: 2 });
      doc.moveDown(0.3);
      doc.x = 56;
    }
    if (section.table) {
      const { columns, rows } = section.table;
      const colW = width / columns.length;
      const drawRow = (cells: string[], header: boolean) => {
        doc.font(header ? 'Helvetica-Bold' : 'Helvetica').fontSize(10);
        const h = Math.max(...cells.map((c) => doc.heightOfString(c, { width: colW - 12 }))) + 12;
        ensureSpace(doc, h);
        const y = doc.y;
        if (header) doc.rect(56, y, width, h).fill(BRAND);
        else doc.rect(56, y, width, h).lineWidth(0.5).stroke('#cbd5e1');
        cells.forEach((cell, i) => {
          doc.fillColor(header ? '#ffffff' : INK).text(cell, 56 + i * colW + 6, y + 6, { width: colW - 12 });
        });
        doc.x = 56;
        doc.y = y + h;
      };
      drawRow(columns, true);
      rows.forEach((r) => drawRow(r, false));
      doc.font('Helvetica').fontSize(11);
    }
    doc.moveDown(1);
  }

  return toBuffer(doc);
}

/** Gera o certificado de conclusão (A4 paisagem). */
export function renderCertificate(opts: {
  name: string;
  code: string;
  issuedAt: Date;
  totalHours: string;
  modules: string[];
}): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, info: { Title: 'Certificado de Conclusão' } });
  const W = doc.page.width;
  const H = doc.page.height;

  doc.rect(0, 0, W, H).fill('#0f172a');
  doc.rect(24, 24, W - 48, H - 48).lineWidth(2).stroke(BRAND);
  doc.rect(32, 32, W - 64, H - 64).lineWidth(0.5).stroke('#334155');

  doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(14).text(config.productName.toUpperCase(), 0, 80, { width: W, align: 'center', characterSpacing: 3 });
  doc.fillColor('#ffffff').fontSize(40).text('CERTIFICADO DE CONCLUSÃO', 0, 115, { width: W, align: 'center' });
  doc.fillColor('#cbd5e1').font('Helvetica').fontSize(14).text('Certificamos que', 0, 190, { width: W, align: 'center' });
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(34).text(opts.name, 60, 220, { width: W - 120, align: 'center' });
  doc.fillColor('#cbd5e1').font('Helvetica').fontSize(14).text(
    `concluiu com êxito o curso ${config.productName}, com carga horária de ${opts.totalHours}, abrangendo:`,
    100, 285, { width: W - 200, align: 'center' },
  );
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(13).text(opts.modules.join('  •  '), 80, 330, { width: W - 160, align: 'center' });

  const date = opts.issuedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
  doc.moveTo(W / 2 - 140, 440).lineTo(W / 2 + 140, 440).lineWidth(1).stroke('#475569');
  doc.fillColor('#cbd5e1').font('Helvetica').fontSize(11).text(`Emitido em ${date}`, 0, 450, { width: W, align: 'center' });
  doc.fillColor('#64748b').fontSize(10).text(`Código de validação: ${opts.code}  ·  ${config.appUrl}/certificado/${opts.code}`, 0, H - 80, { width: W, align: 'center' });

  return toBuffer(doc);
}
