const { exec } = require('child_process');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

async function generatePdf(individual_path, data, output_pdf_path) {
    try {
        // Step 1: Read and compile the EJS template
        const fn = ejs.compile(fs.readFileSync(individual_path, "utf8"), {
            filename: individual_path,
        });
        // console.log('fn---', fn);
        // console.log('fn--to string-', fn.toString());

        // Step 2: Generate HTML from the template
        const html = fn({
            basedir: __dirname, // Assuming `basedir` is the current directory
            result: data
        });

        // console.log('html---', html);
        // console.log('JSON.stringify(html)---', JSON.stringify(html));

        // Step 3: Save the HTML to a temporary file
        const tempHtmlPath = path.join(__dirname, 'temp.html');
        console.log('tempHtmlPath---', output_pdf_path);
        fs.writeFileSync(tempHtmlPath, html);

        // Step 4: Convert the HTML to PDF using WeasyPrint
        const command = `weasyprint ${tempHtmlPath} ${output_pdf_path}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error generating PDF:', stderr);
                throw new Error(`Error generating PDF: ${stderr}`);
            } else {
                console.log('PDF generated successfully!');
                // Clean up the temporary HTML file
                fs.unlinkSync(tempHtmlPath);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return {
            status: 'ERROR',
            message: error.message
        };
    }
}

// Example usage:
(async () => {
    const individual_path = './src/template.ejs'; // Path to your EJS template
    const data = {}; // Your data object
    const output_pdf_path = './output.pdf'; // Path where the PDF will be saved
    await generatePdf(individual_path, data, output_pdf_path);
})();
