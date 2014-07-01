mongo localhost:27017/test mongodb-create.js

set pathname=.\public\levels

for %%file in (%pathname%\*) do mongoimport --db NTBdb --collection levels --file %%file