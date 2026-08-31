-- "pdf" was always meant to cover any uploaded file (templates, seminar
-- slides, books), not literally just PDFs — rename it to reflect that.
alter type resource_type rename value 'pdf' to 'file';
