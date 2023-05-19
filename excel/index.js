import XLSX from 'xlsx';
import { downloadYT,GET_HREF_CNTV,downloadVideo, downloadFile, GET_HREF_KHAN_YT, get_mime_type } from './../file_types/index.js';
import normalizeString from './../helpers/normalizeString.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { join } from 'path';
import {__dirname} from './../basepaths.js';

const excel_name = 'lista-de-recursos-abril.xlsx';

const workbook = XLSX.readFile(excel_name);
const sheet_name = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheet_name];

const main = async () => { 

   const dl_folder = 'downloads';

   const __dir_downloads = fs.existsSync(join(__dirname,dl_folder));
   __dir_downloads?'':fs.mkdirSync(join(__dirname,dl_folder));

   let data = XLSX.utils.sheet_to_json(worksheet);
   // data = data.filter(e=>{
   //    return e.Estado != ('En Registro de RADI' || 'Rechazado');
   // });

   const browser = await puppeteer.launch();
   const page = await browser.newPage();

   let index = 0;
   let downloaded_resources = 0;
   for (const el of data) {

      if(el['Estado'] == 'En Registro de RADI' || el['Estado'] == 'Rechazado'){
         index++;
         continue;
      }

      try {
         const title = normalizeString(el['Título']);
         const level = el['Nivel'].toLowerCase();
         const grade = el['Grado'];
         const area = el['Area'].toLowerCase()
                                 .normalize('NFD')
                                 .replace(/[\u0300-\u036f]/g, '') //TODO: Eliminar tíldes
                                 .replace(/[^\w\s]/g, ''); //TODO: Eliminar caracteres no alfanuméricos
         const competence = el['Competencia'].toLowerCase()
                                 .normalize('NFD')
                                 .replace(/[\u0300-\u036f]/g, '') //TODO: Eliminar tíldes
                                 .replace(/[^\w\s]/g, ''); //TODO: Eliminar caracteres no alfanuméricos
   
         //TODO: Comprueba si existe el directorio, sino lo crea.
         const __dir_level = fs.existsSync(join(__dirname,dl_folder,level));
         __dir_level?'':fs.mkdirSync(join(__dirname,dl_folder,level));
   
         let path = '';
   
         if(level == 'primaria'){
            const __dir_grade = fs.existsSync(join(__dirname,dl_folder,level,grade));
            __dir_grade?'':fs.mkdirSync(join(__dirname,dl_folder,level,grade));
   
            const __dir_area = fs.existsSync(join(__dirname,dl_folder,level,grade,area));
            __dir_area?'':fs.mkdirSync(join(__dirname,dl_folder,level,grade,area));
   
            const __dir_competence = fs.existsSync(join(__dirname,dl_folder,level,grade,area,competence));
            __dir_competence?'':fs.mkdirSync(join(__dirname,dl_folder,level,grade,area,competence));
   
            path = join(__dirname,dl_folder,level,grade,area,competence);
   
         }
         if(level == 'secundaria'){
            const __dir_area = fs.existsSync(join(__dirname,dl_folder,level,area));
            __dir_area?'':fs.mkdirSync(join(__dirname,dl_folder,level,area));
   
            const __dir_grade = fs.existsSync(join(__dirname,dl_folder,level,area,grade));
            __dir_grade?'':fs.mkdirSync(join(__dirname,dl_folder,level,area,grade));
   
            const __dir_competence = fs.existsSync(join(__dirname,dl_folder,level,area,grade,competence));
            __dir_competence?'':fs.mkdirSync(join(__dirname,dl_folder,level,area,grade,competence));
   
            path = join(__dirname,dl_folder,level,area,grade,competence);
   
         }
            if(el['Tipo de archivo'] == 'Video'){
               if(el['Enlace'].includes('yout')){
                  const fileAlreadyExist = fs.existsSync(join(path,`${title}.mp4`));
                  if(fileAlreadyExist){
                     index++;
                     continue;
                  }
                  const file = await downloadYT(el['Enlace'],path,`${title}.mp4`);
                  if(file){
                     XLSX.utils.sheet_add_aoa(worksheet,[[join(path,`${title}.mp4`)]],{origin: 'AB' + (index + 2)});
                     await XLSX.writeFile(workbook, excel_name);
                     index++;
                     downloaded_resources++;
                     continue;
                  }else{
                     XLSX.utils.sheet_add_aoa(worksheet,[['PROBLEMAS EN LA DESCARGA']],{origin: 'AB' + (index + 2)});
                     await XLSX.writeFile(workbook, excel_name);
                     index++;
                     continue;

                  }
               }
               if(el['Enlace'].includes('cntv')){
                  const fileAlreadyExist = fs.existsSync(join(path,`${title}.mp4`));
                  if(fileAlreadyExist){
                     index++;
                     continue;
                  }
                  const link = await GET_HREF_CNTV(page,el['Enlace']);
                  if(link){
                     const video = await downloadVideo(link,path,`${title}.mp4`);
                     if(video){
                        XLSX.utils.sheet_add_aoa(worksheet,[[join(path,`${title}.mp4`)]],{origin: 'AB' + (index + 2)});
                        await XLSX.writeFile(workbook, excel_name);
                        index++;
                        downloaded_resources++;
                        continue;
                     }else{
                        XLSX.utils.sheet_add_aoa(worksheet,[['PROBLEMAS EN LA DESCARGA']],{origin: 'AB' + (index + 2)});
                        await XLSX.writeFile(workbook, excel_name);
                        index++;
                        continue;
                     }
                  }else{
                     XLSX.utils.sheet_add_aoa(worksheet,[['EL ENLACE NO TIENE BOTÓN DE DESCARGA']],{origin: 'AB' + (index + 2)});
                     await XLSX.writeFile(workbook, excel_name);
                     index++;
                     continue;
                  }
               }
               if(el['Enlace'].includes('khanacademy')){
                  const fileAlreadyExist = fs.existsSync(join(path,`${title}.mp4`));
                  if(fileAlreadyExist){
                     index++;
                     continue;
                  }
                  const link = await GET_HREF_KHAN_YT(page,el['Enlace']);
                  if(link){
                     const video = await downloadYT(link,path,`${title}.mp4`);
                     if(video){
                        XLSX.utils.sheet_add_aoa(worksheet,[[join(path,`${title}.mp4`)]],{origin: 'AB' + (index + 2)});
                        await XLSX.writeFile(workbook, excel_name);
                        index++;
                        downloaded_resources++;
                        continue;
                     }else{
                        XLSX.utils.sheet_add_aoa(worksheet,[['PROBLEMAS EN LA DESCARGA']],{origin: 'AB' + (index + 2)});
                        await XLSX.writeFile(workbook, excel_name);
                        index++;
                        continue;
                     }
                  }else{
                     XLSX.utils.sheet_add_aoa(worksheet,[['ESTE ENLACE DE KHAN ACADEMY NO TIENE IFRAME']],{origin: 'AB' + (index + 2)});
                     await XLSX.writeFile(workbook, excel_name);
                     index++;
                     continue;
                  }
                  
               }else{
                  const mime = await get_mime_type(el['Enlace']);
                  if(mime == 'video/mp4'){

                  }else{
                     XLSX.utils.sheet_add_aoa(worksheet,[['NO ES YOUTUBE/CNTV/KHAN_ACADEMY O FORMATO DE VIDEO']],{origin: 'AB' + (index + 2)});
                     await XLSX.writeFile(workbook, excel_name);
                     index++;
                     continue;
                  }
               }
            }
            if(el['Tipo de archivo'] == 'Archivo PDF'){
               const fileAlreadyExist = fs.existsSync(join(path,`${title}.pdf`));
                  if(fileAlreadyExist){
                     index++;
                     continue;
                  }
               const file = await downloadFile(el['Enlace'],path,title);
               if(file.ok){
                  XLSX.utils.sheet_add_aoa(worksheet,[[join(path,`${file.filename}`)]],{origin: 'AB' + (index + 2)});
                  await XLSX.writeFile(workbook, excel_name);
                  index++;
                  downloaded_resources++;
                  continue;
               }else{
                  XLSX.utils.sheet_add_aoa(worksheet,[['PROBLEMAS EN LA DESCARGA']],{origin: 'AB' + (index + 2)});
                  await XLSX.writeFile(workbook, excel_name);
                  index++;
                  continue;
               }
            }
            if(el['Tipo de archivo'] == 'Audio'){
               const fileAlreadyExist = fs.existsSync(join(path,`${title}.mp3`));
                  if(fileAlreadyExist){
                     index++;
                     continue;
                  }
               const file = await downloadFile(el['Enlace'],path,title);
               if(file.ok){
                  XLSX.utils.sheet_add_aoa(worksheet,[[join(path,`${file.filename}`)]],{origin: 'AB' + (index + 2)});
                  await XLSX.writeFile(workbook, excel_name);
                  index++;
                  downloaded_resources++;
                  continue;
               }else{
                  XLSX.utils.sheet_add_aoa(worksheet,[['PROBLEMAS EN LA DESCARGA']],{origin: 'AB' + (index + 2)});
                  await XLSX.writeFile(workbook, excel_name);
                  index++;
                  continue;
               }
            }
            
            else{
               XLSX.utils.sheet_add_aoa(worksheet,[['NO DESCARGADO']],{origin: 'AB' + (index + 2)});
               await XLSX.writeFile(workbook, excel_name);
               index++;
               continue;
            }
      } catch (error) {
         index++;
         continue;
      }
   }
   await browser.close();
   console.log(`SE HAN DESCARGADO ${downloaded_resources} RECURSOS`)
 }

 main();


