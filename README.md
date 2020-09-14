# Digitales Klassenzimmer

This repository provides a minimal digital classroom embeding a livestream (either YouTube or Vimeo) side-by-side with a Jitsi conference room. The ratio between both panes can be changed dynmically and additonally switched via a button bar.

## Adding a class room

Virtual class rooms are added by creating a corresponding JSON file under `api/room` with the following content:

```yaml
{
  "title": "Example room",
  "ytLink": "dQw4w9WgXcQ",
  "jitsiRoom": "secret_room_name"
}
```
for embeding a YouTube stream or

```yaml
{
  "title": "Example room",
  "vimeoID": "148751763",
  "jitsiRoom": "secret_room_name"
}
```

for embeding a vimeo stream.

The file name is also the name of the classroom and can either be typed in on the landing page or opened directly by appending the class room name to the root URL (see below).

## Open class rooms via URL

To support opening class rooms directly via URL, you need to add the following snippet to your nginx configuration:

```nginx
location / {
    try_files $uri /index.html;
}
```

## License

This code has been commissioned by the municipal government of [Stadt Bühl](https://www.buehl.de) and is released under the [MIT License](https://opensource.org/licenses/MIT). We support the campaign [Public Money, Public Code](https://publiccode.eu/) and the [Free Software Foundation Europe](https://fsfe.org). Feel free to use, copy, modify, merge, publish, distribute, sublicense and/or sell this application.