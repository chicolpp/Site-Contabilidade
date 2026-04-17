import re

filepath = r"src\pages\CadastroUsuarios.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Substitute the cargos array
old_cargos = r'const cargos = \[.*?\];'
new_cargos = 'const cargos = [\n    { value: "contabilidade", label: "Contabilidade" },\n    { value: "cliente", label: "Cliente" },\n  ];'
content = re.sub(old_cargos, new_cargos, content, flags=re.DOTALL)

# 2. Defaults from "porteiro" to "contabilidade"
content = content.replace('cargo: "porteiro"', 'cargo: "contabilidade"')
content = content.replace('cargo: "todos"', 'cargo: "todos"') # untouched

# 3. Strip `unidade: "",` and `unidade: usuario.unidade || "",`
content = re.sub(r'unidade:\s*".*?",?', '', content)
content = re.sub(r'unidade:\s*usuario\.unidade\s*\|\|\s*"",?', '', content)
content = re.sub(r'unidade:\s*editFormData\.unidade\s*\|\|\s*"",?', '', content)

# 4. Remove `data.append("unidade", ...)`
content = re.sub(r'data\.append\("unidade",.*?\);', '', content)

# 5. Remove UI block for Unidade from the layout
form_group_unidade = r'<div className="form-group half-width">.*?<label>Unidade.*?</div>'
content = re.sub(form_group_unidade, '', content, flags=re.DOTALL)
form_group_unidade_edit = r'<div className="form-group half-width input-unidade">.*?<label>Unidade.*?</div>'
content = re.sub(form_group_unidade_edit, '', content, flags=re.DOTALL)

# Let's cleanly remove fields containing "Veículo"
content = re.sub(r'<div className="form-group full-width checkbox-group">.*?<label className="checkbox-label">.*?<span className="checkbox-text">Tem veículo.*?</label>.*?</div>', '', content, flags=re.DOTALL)

# Some specific replacements are safer string by string
content = content.replace('unidade: formData.unidade || "",', '')
content = content.replace('unidade: editFormData.unidade || "",', '')

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Modified CadastroUsuarios.jsx successfully.")
