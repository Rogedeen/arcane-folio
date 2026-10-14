import fs from 'fs';
import path from 'path';

function findJsonFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findJsonFiles(fullPath));
    } else if (file.endsWith('.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

function validateSpell(spell, filePath) {
  const required = [
    'slug', 'name', 'level', 'school', 'castingTime',
    'range', 'components', 'duration', 'description',
    'classes', 'source', 'source_ref', 'license'
  ];
  for (const field of required) {
    if (spell[field] === undefined || spell[field] === null || spell[field] === '') {
      throw new Error(`Dosya: ${filePath} -> Zorunlu alan eksik: ${field}`);
    }
  }
  if (typeof spell.level !== 'number' || spell.level < 0 || spell.level > 9) {
    throw new Error(`Dosya: ${filePath} -> 'level' 0 ile 9 arasında sayı olmalı!`);
  }
  if (!Array.isArray(spell.classes)) {
    throw new Error(`Dosya: ${filePath} -> 'classes' dizi olmalı!`);
  }
}

function validateItem(item, filePath) {
  const required = [
    'slug', 'name', 'type', 'cost', 'weight',
    'description', 'quantity', 'source', 'source_ref', 'license'
  ];
  for (const field of required) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      throw new Error(`Dosya: ${filePath} -> Zorunlu alan eksik: ${field}`);
    }
  }
  const validTypes = ['weapon', 'armor', 'shield', 'gear', 'potion', 'scroll'];
  if (!validTypes.includes(item.type)) {
    throw new Error(`Dosya: ${filePath} -> Geçersiz 'type': ${item.type}`);
  }
  if (typeof item.weight !== 'number' || item.weight < 0) {
    throw new Error(`Dosya: ${filePath} -> 'weight' pozitif sayı olmalı!`);
  }
}

function runValidation() {
  console.log('--- İçerik Şema Doğrulaması Başlatılıyor ---');

  const spellsDir = path.resolve('content/spells');
  const itemsDir = path.resolve('content/items');

  const spellFiles = findJsonFiles(spellsDir);
  const itemFiles = findJsonFiles(itemsDir);

  console.log(`Bulunan büyü dosyası sayısı: ${spellFiles.length}`);
  console.log(`Bulunan eşya dosyası sayısı: ${itemFiles.length}`);

  let errors = 0;

  for (const f of spellFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(f, 'utf8'));
      validateSpell(data, f);
    } catch (err) {
      console.error(`❌ Büyü Hatası: ${err.message}`);
      errors++;
    }
  }

  for (const f of itemFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(f, 'utf8'));
      validateItem(data, f);
    } catch (err) {
      console.error(`❌ Eşya Hatası: ${err.message}`);
      errors++;
    }
  }

  if (spellFiles.length < 50) {
    console.error(`❌ Kriter Hatası: En az 50 büyü gerekli, bulunan: ${spellFiles.length}`);
    errors++;
  }

  if (itemFiles.length < 50) {
    console.error(`❌ Kriter Hatası: En az 50 eşya gerekli, bulunan: ${itemFiles.length}`);
    errors++;
  }

  if (errors > 0) {
    console.error(`\n❌ Toplam ${errors} hata bulundu. Doğrulama BAŞARISIZ!`);
    process.exit(1);
  } else {
    console.log(`\n✅ Başarılı: ${spellFiles.length} büyü ve ${itemFiles.length} eşya şemaya tam uyumlu doğrulandı!`);
  }
}

runValidation();
