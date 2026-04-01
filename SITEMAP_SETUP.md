# Sitemap Setup Guide

This document outlines the setup for dynamic sitemaps in the application. 

> **Important Constraint Notice:**  
> The React + Vite environment provided is strictly a **frontend-only** platform. It does not support setting up, deploying, or running custom server-side Node.js applications or Firebase Cloud Functions directly within this container. Features requesting backend XML endpoints (`/api/sitemaps/*`) and `firebase-admin` dependencies cannot be implemented natively here. Sitemaps are instead handled by frontend React-router renderers (`SitemapRenderer.jsx`).

## Frontend Sitemap Architecture
The application generates sitemaps dynamically on the client side when specific routes are accessed:
- `/sitemap.xml`
- `/product-sitemap.xml`
- `/category-sitemap.xml`
- `/page-sitemap.xml`

### Generating XML Sitemaps
We have created a custom hook `useSitemapGenerator.js` that compiles the current context data (Products, Categories, Pages) into an XML format.

## Setup Instructions (For External Backend)
If you wish to offload the sitemap generation to Firebase Cloud Functions (as originally requested) outside of this frontend environment, follow these steps in your separate Firebase backend project:

### 1. Initialize Firebase Functions