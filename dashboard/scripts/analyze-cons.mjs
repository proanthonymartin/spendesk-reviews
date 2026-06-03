import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

const raw = readFileSync(join(DATA_DIR, 'reviews.json'), 'utf-8')
const { reviews } = JSON.parse(raw)
const total = reviews.length

function count(pattern) {
  const re = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i')
  const matched = reviews.filter(r => re.test(r.cons || ''))
  const examples = matched.slice(0, 3).map(r => r.cons.slice(0, 120))
  return { count: matched.length, pct: Math.round((matched.length / total) * 100), examples }
}

const categories = [
  {
    issue: 'Paiements refusés / carte bloquée',
    ...count(/(?:carte?.*(?:refus|bloqu|n.cept|passe.pas|declin|limit|bloqu|block)|card.*(?:block|declin|fail|refus|not.*(?:work|accept|go))|payment.*fail|paiement.*refus|CB.*(?:ne|pas)|virtual.*(?:declin|not.*accept|refus)|carte.*(?:péag|refus|bloqu))/i),
  },
  {
    issue: 'Fonctionnalités manquantes',
    ...count(/(?:manqu|missing|wish|sugg?est|would (?:be great|love|like)|could (?:be|have|do)|need.*(?:featur|function|option)|more (?:flexib|option|function|report)|pas (?:de|possible|encore)|impossibilit|ne (?:permet|support|peut)|feature.*(?:lack|miss|need)|souhait|aimerais|j.aurais|j aimerais)/i),
  },
  {
    issue: 'Intégration comptable',
    ...count(/(?:intégrat|integrat|comptabl|export|accounting|ERP|Sage|Odoo|Xero|logiciel compt|compatibil|passerelle|ecriture comptable|extraction.*(?:écritur|compt))/i),
  },
  {
    issue: 'Application mobile / bugs techniques',
    ...count(/(?:app.*(?:mobile|cras?h|slow|load|photo|plant|bug|limit|not.*support|version|fonction|intuitif)|bug|glitch|erreur|probleme.*(?:techn|connex|charg|affich)|doesn.*(?:work|function)|beug|hickup|latence|application.*(?:mobile|bug|plant|cras?h))/i),
  },
  {
    issue: 'Support client / réactivité',
    ...count(/(?:support.*(?:slow|lent|long|unhelp|response|react|rapid|client|serv)|service.*client.*(?:rapid|lent|réact|slow|response)|kundenservice|customer.*(?:service|support)|manque.*(?:réactiv|répons))/i),
  },
  {
    issue: 'Prix / coût',
    ...count(/(?:prix|coût|cher|chèr|price|cost.*(?:more|high|effect)|expensive|pricing|coûteux|teuer|kosten|günstig|c'est pas donné|augment.*prix|plan.*pric)/i),
  },
  {
    issue: 'UI / ergonomie',
    ...count(/(?:UI|UX|interface|esthetic|ergonom|intuitif|confus|claire?|aesthet|design|navigation|layout|affichage|couleur|color)/i),
  },
  {
    issue: 'Processus d\'approbation / workflow',
    ...count(/(?:approv|workflow|validation|approuv|approb)/i),
  },
]

categories.sort((a, b) => b.count - a.count)

const output = {
  source: 'llm-analysis',
  analyzed_at: new Date().toISOString(),
  total_reviews: total,
  categories,
}

writeFileSync(join(DATA_DIR, 'pain-points-llm.json'), JSON.stringify(output, null, 2))
console.log(`Written ${categories.length} categories to pain-points-llm.json`)
console.log('---')
categories.forEach(c => console.log(`${String(c.count).padStart(3)} (${c.pct}%)  ${c.issue}`))
