cmd_Release/obj.target/dadd.node := g++ -shared -pthread -rdynamic  -Wl,-soname=dadd.node -o Release/obj.target/dadd.node -Wl,--start-group Release/obj.target/dadd/dadd.o -Wl,--end-group 
