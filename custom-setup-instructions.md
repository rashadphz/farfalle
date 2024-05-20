# Custom Setup Instructions

## Accessing Farfalle from a Different Computer

If you are accessing Farfalle from a different computer in the network, replace `localhost` with the private IP address of the server Farfalle is running on in the docker-compose. For example:

```yaml
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://your-private-ip-address:8000}
```
...
