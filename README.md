# WMRRA.com

Welcome to the repository for the [WMRRA.com](https://wmrra.com) website!

# Running Locally

This project uses a static site generator called [Hugo](https://gohugo.io).

1) Install [Hugo](https://gohugo.io/getting-started/installing/#quick-install).
   ```bash
   $ git clone https://github.com/gohugoio/hugo.git
   $ cd hugo
   $ go install --tags extended
   ```
2) From the root of this repository run `hugo server` from a commandline.

3) browse to http://localhost:1313

# Contributing

If you would like to suggest a feature or report a bug, you can
[file an issue](https://github.com/wmrra/wmrra-com/issues/new/choose).

We welcome contributions from the community. A good place to start is to create
an [issue](https://github.com/wmrra/wmrra-com/issues/new/choose) and to discuss
the change you would like to make before proceeding.

# Common Tasks
Here are a few common updates you may want to make to the site.

## Adding an image
Images should all be in **WebP** format to ensure fast page loads. Keep images <= 2560px wide.

You can use [squoosh](https://squoosh.app/) to resize and convert images to WebP.

## Adding a news post
News posts are nested under [content/news](content/news)

It is likely easiest to copy the last post and use it as a template for your newest post.

Each post needs to include the following fore-data:
```
---
title   : "A title of a post"
date    : "2021-01-01"
draft   : false
description: "A brief description of the post that shows on the front page."
```

## Updating Schedules
The schedule is defined at [data/schedule.yml](data/schedule.yml)

## Updating Racer Numbers
For a racer page to be maintained, we need the following each year:
- Spreadsheet of current rider info + retired race numbers with the following columns: Last name | First name | Race number
- Photo of each rider that is 346px x 300px with the rider as centered as possible

If anyone is willing to provide this, we can add a page showcasing all of WMMRA's racers.
Note we do not need photos of every racer to make this possible, but having > 50% photo coverage is ideal.

## Updating the Menu
The menu is defined at [data/menu.yml](data/menu.yml)

Menu items can either be a top-level link or label with links in a submenu.

Top-level links are defined this way:
```
- name: Volunteer
  link: /volunteer
```

Labels with submenus are defined this way:
```
  - name: Resources
    children: 
      - name: Schedule
        link: /race/schedule
      - name: Rulebook
        link: /race/rulebook
```

## Updating Sponsors
Sponsors are listed in a data file at [data/sponsors.yml](data/sponsors.yml)

A sponsor entry is defined as follows:

```
  - name          : Sponsor Name
    image         : images/sponsors/sponsor-placeholder.jpg
    description   : >
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur
      necessitatibus ullam, culpa odio.
    social:
      facebook : https://www.facebook.com/
      twitter  : https://twitter.com/
      website  : https://website.com/
```

## Updating Contacts
Contacts are listed in a data file at [data/contacts.yml](data/contacts.yml)

A contact is defined as follows:
```
  - position: Position Name
    name: First Last
    phone:
    email:
```

## Other Pages
Pages on this site can be found at [content](content) or [layouts/partials](layouts/partials)
