import JSZip from 'jszip';
import { PROJETO_SPRING_BOOT } from '../data/springBootProject.js';
import { PROJETO_JAVASCRIPT } from '../data/javaScriptProject.js';

/**
 * Utilitário para gerar e baixar arquivos em formato .ZIP diretamente no navegador
 */
export async function baixarArquivosComoZip(tipo = 'TODOS') {
  const zip = new JSZip();

  const readmeGeral = `# Vintage&Co Barbearia — Sistema Completo de Agendamento
Código desenvolvido para Barbearia Vintage&Co com banco de dados PostgreSQL e DDD (85) - Ceará.

## Conteúdo deste Pacote:
1. /spring-boot-java : Projeto completo em Java 21 + Spring Boot 3 + Spring Data JPA + PostgreSQL
2. /nodejs-javascript : Projeto completo em Node.js + Express + driver nativo "pg" + PostgreSQL
3. /database : Scripts SQL DDL (schema.sql) com tabelas, chaves estrangeiras, índices e docker-compose.yml

## Como Rodar o Banco PostgreSQL com Docker:
\`\`\`bash
docker compose up -d
\`\`\`
O banco estará acessível em: localhost:5432 (usuário: postgres, senha: vintage_secret_pwd, database: vintage_barbearia)

## Como Rodar o Projeto Java Spring Boot:
\`\`\`bash
cd spring-boot-java
mvn clean spring-boot:run
\`\`\`
Acesse o Swagger em: http://localhost:8080/swagger-ui.html

## Como Rodar o Projeto JavaScript (Node.js):
\`\`\`bash
cd nodejs-javascript
npm install
npm run dev
\`\`\`
Servidor rodando em: http://localhost:3000
`;

  if (tipo === 'TODOS' || tipo === 'JAVA') {
    const javaFolder = tipo === 'TODOS' ? zip.folder('spring-boot-java') : zip;
    PROJETO_SPRING_BOOT.forEach((file) => {
      javaFolder.file(file.caminho, file.conteudo);
    });

    const readmeJava = `# Vintage&Co — Backend Java Spring Boot 3 + PostgreSQL

### Arquivo Principal de Junção de Dados:
- **src/main/java/com/vintageco/barbearia/service/AgendamentoService.java**: Faz a junção entre Cliente (com DDD 85), Barbeiro, Serviço, checa conflito de horários no banco e persiste na tabela 'tb_agendamento'.

### Execução:
\`\`\`bash
# 1. Subir banco de dados
docker compose up -d

# 2. Rodar aplicação Spring Boot
mvn spring-boot:run
\`\`\`
`;
    javaFolder.file('README.md', readmeJava);
  }

  if (tipo === 'TODOS' || tipo === 'JS') {
    const jsFolder = tipo === 'TODOS' ? zip.folder('nodejs-javascript') : zip;
    PROJETO_JAVASCRIPT.forEach((file) => {
      jsFolder.file(file.caminho, file.conteudo);
    });

    const readmeJs = `# Vintage&Co — Backend JavaScript (Node.js) + PostgreSQL

### Arquivo Principal de Junção de Dados:
- **src/services/agendamentoService.js**: Faz a junção entre Cliente (com DDD 85), Barbeiro, Serviço, checa conflito de horários no banco e persiste na tabela 'tb_agendamento'.

### Execução:
\`\`\`bash
# 1. Subir banco de dados
docker compose up -d

# 2. Instalar dependências e rodar
npm install
npm run dev
\`\`\`
`;
    jsFolder.file('README.md', readmeJs);
  }

  if (tipo === 'TODOS') {
    zip.file('README.md', readmeGeral);
    // Também adiciona os arquivos de banco na raiz
    const schemaFile = PROJETO_SPRING_BOOT.find((f) => f.nome === 'schema.sql');
    if (schemaFile) {
      zip.file('schema.sql', schemaFile.conteudo);
    }
    const dockerFile = PROJETO_SPRING_BOOT.find((f) => f.nome === 'docker-compose.yml');
    if (dockerFile) {
      zip.file('docker-compose.yml', dockerFile.conteudo);
    }
  }

  // Gera o arquivo ZIP binário
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // Dispara o download automático no navegador
  const nomeArquivo =
    tipo === 'JAVA'
      ? 'vintageco-barbearia-spring-boot-java.zip'
      : tipo === 'JS'
      ? 'vintageco-barbearia-nodejs-javascript.zip'
      : 'vintageco-barbearia-todos-os-arquivos.zip';

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  return nomeArquivo;
}
