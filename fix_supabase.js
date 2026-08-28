const fs = require('fs');
const file = 'src/lib/supabase/server.ts';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/if \(error\) throw new Error\(`(.*)`\)/g, "if (error) {\n    console.warn(`Fetch error $1`);\n    return [] as any;\n  }");
fs.writeFileSync(file, data);
