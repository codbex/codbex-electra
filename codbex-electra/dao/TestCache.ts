import { caches } from "sdk/cache";
import { response } from "sdk/http";

response.println("Blah");

caches.set("key1", "Value");
if (caches.contains("key1")) {
    response.println("HAS element in cache");
} else {
    response.println("Has NO element in cache");
}