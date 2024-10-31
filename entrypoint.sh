#!/bin/sh
ROOT_DIR=/usr/local/apache2/htdocs
# Replace env vars in files served by httpd
for file in $ROOT_DIR/js/*.js* $ROOT_DIR/index.html;
do
  sed -i 's|VUE_APP_API_BASE|'${VUE_APP_API_BASE}'|g' $file
  sed -i 's|VUE_APP_API_FIREHOSE|'${VUE_APP_API_FIREHOSE}'|g' $file
done
httpd-foreground 