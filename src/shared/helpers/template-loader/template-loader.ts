import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

/**
 * Loads and compiles a Handlebars template from the shared/templates directory.
 * @param templateName The name of the template file (e.g., 'company-created.hbs').
 * @returns A compiled Handlebars template delegate.
 * @throws An error if the template cannot be loaded or compiled.
 */
export function loadTemplate(
  templateName: string,
): handlebars.TemplateDelegate {
  try {
    const templatesFolderPath = path.resolve(
      __dirname,
      '..',
      '..',
      'templates',
    );
    const templatePath = path.join(templatesFolderPath, templateName);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to load template ${templateName}: ${errorMessage}`);
  }
}
