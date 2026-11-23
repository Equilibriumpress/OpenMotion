import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const projectsDir = path.join(rootDir, 'projects');
const outDir = path.join(rootDir, 'public', 'projects');
const outFile = path.join(outDir, 'manifest.json');

const projects = [];

if (fs.existsSync(projectsDir)) {
  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const candidate = path.join(projectsDir, entry.name, 'project.json');
      if (fs.existsSync(candidate)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'));
          projects.push(parsed);
        } catch (err) {
          console.warn(`Skipping invalid JSON in ${candidate}:`, err.message);
        }
      }
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'manifest.json') {
      const candidate = path.join(projectsDir, entry.name);
      try {
        const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        projects.push(parsed);
      } catch (err) {
        console.warn(`Skipping invalid JSON in ${candidate}:`, err.message);
      }
    }
  }
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  outFile,
  JSON.stringify(
    {
      schemaVersion: '1.0',
      updatedAt: new Date().toISOString(),
      count: projects.length,
      projects,
    },
    null,
    2
  )
);

console.log(`[openmotion] Indexed ${projects.length} project(s) into public/projects/manifest.json`);
