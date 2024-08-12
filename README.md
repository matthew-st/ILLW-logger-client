# ILLW logger v2

- add persistance for qsos (action handler - keep track and send when connected)
- N1MM almost done 
- finish classes in the websocketClient.ts file
- create event listeners for udpServer - parse XML into JSON

helper classes are allowed to send snackbar messages over ipc channels as they do not require processing. items that require processing must be handled in background.ts