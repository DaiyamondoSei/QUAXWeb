import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import Link from 'next/link';
import Head from 'next/head';

export async function getStaticPaths() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDirectory);
  const paths = filenames.map((filename) => ({
    params: { slug: filename.replace(/\.md$/, '') },
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), 'posts', `${params.slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  const mdxSource = await serialize(content);
  
  // Ensure all frontmatter data is JSON-serializable
  const serializedFrontmatter = {
    ...data,
    date: data.date ? String(data.date) : '',
    title: String(data.title || ''),
    author: String(data.author || ''),
    category: String(data.category || ''),
    excerpt: String(data.excerpt || ''),
    image: data.image ? String(data.image) : ''
  };
  
  return { props: { frontmatter: serializedFrontmatter, mdxSource, slug: params.slug } };
}

export default function EntanglementPost({ frontmatter, mdxSource, slug }) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Use a more accessible notification method
      const notification = document.createElement('div');
      notification.textContent = 'Link copied to clipboard!';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00B8FF;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 1000;
        font-size: 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (err) {
      return dateString;
    }
  };

  return (
    <>
      <Head>
        <title>{frontmatter.title} | Entanglement Log</title>
        <meta name="description" content={frontmatter.excerpt} />
        <meta name="theme-color" content="#050520" />
        <meta property="og:title" content={frontmatter.title} />
        <meta property="og:description" content={frontmatter.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://quannex.earth/entanglement-log/${slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={frontmatter.title} />
        <meta name="twitter:description" content={frontmatter.excerpt} />
        <link rel="canonical" href={`https://quannex.earth/entanglement-log/${slug}`} />
        <link rel="stylesheet" href="/styles/styles.css" />
        <link rel="stylesheet" href="/styles/footer.css" />
        <link rel="stylesheet" href="/styles/dropdown.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        <link rel="stylesheet" href="/styles/responsive.css" />
      </Head>
      
      <main style={{ minHeight: '100vh', background: '#050520', paddingTop: '7rem' }} role="main">
        <style jsx>{`
          .entangle-back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #8ad6ff;
            font-size: 1.1rem;
            margin: 2rem 1rem;
            text-decoration: none;
            transition: color 0.2s;
            padding: 0.5rem;
            border-radius: 8px;
            min-height: 44px;
            min-width: 44px;
          }
          .entangle-back-link:hover,
          .entangle-back-link:focus {
            color: #00B8FF;
            outline: 2px solid #00B8FF;
            outline-offset: 2px;
          }
          .entangle-post-hero {
            min-height: 40vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem 2rem 1rem;
            background: linear-gradient(120deg, #050520 60%, #6E00FF 100%);
            position: relative;
            overflow: hidden;
          }
          .entangle-post-hero::before {
            content: '';
            position: absolute;
            top: -80px; left: 50%;
            width: 900px; height: 400px;
            background: radial-gradient(circle at 50% 30%, #00B8FF44 0%, #6E00FF11 100%);
            filter: blur(60px);
            opacity: 0.7;
            transform: translateX(-50%);
            z-index: 0;
          }
          .entangle-post-hero-content {
            position: relative;
            z-index: 2;
            padding: 2.5rem 2rem 1.5rem 2rem;
            border-radius: 24px;
            background: rgba(5, 5, 32, 0.25);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(110, 0, 255, 0.15);
            box-shadow: 0 8px 32px 0 rgba(0,0,0,0.18), 0 0 40px #6E00FF22, inset 0 0 20px #00B8FF11;
            text-align: center;
            max-width: 800px;
            width: 100%;
          }
          .entangle-post-title {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(90deg, #6E00FF 0%, #00B8FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
            line-height: 1.2;
          }
          .entangle-post-meta {
            font-size: 1.05rem;
            color: #8ad6ff;
            margin-bottom: 1.2rem;
          }
          .entangle-post-actions {
            display: flex;
            gap: 1.5rem;
            align-items: center;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          .entangle-post-actions a, .entangle-post-actions button {
            color: #00B8FF;
            font-size: 1.25rem;
            background: none;
            border: none;
            cursor: pointer;
            transition: color 0.2s, transform 0.2s;
            outline: none;
            padding: 0.75rem;
            border-radius: 8px;
            min-height: 44px;
            min-width: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .entangle-post-actions a:hover, 
          .entangle-post-actions button:hover,
          .entangle-post-actions a:focus, 
          .entangle-post-actions button:focus {
            color: #6E00FF;
            transform: scale(1.15);
            outline: 2px solid #6E00FF;
            outline-offset: 2px;
          }
          .entangle-post-content {
            max-width: 800px;
            margin: 0 auto 2.5rem auto;
            padding: 2.5rem 1.2rem 1.5rem 1.2rem;
            background: rgba(5, 5, 32, 0.85);
            border-radius: 20px;
            box-shadow: 0 2px 16px 0 #6E00FF22, 0 1.5px 8px 0 #00B8FF11;
            border: 1px solid rgba(110, 0, 255, 0.10);
            font-size: 1.18rem;
            color: #e0eaff;
            line-height: 1.7;
            position: relative;
          }
          .entangle-post-content :global(p) {
            margin-bottom: 1.3rem;
          }
          .entangle-post-content :global(blockquote) {
            border-left: 4px solid #00B8FF;
            margin: 1.5rem 0;
            padding: 0.5rem 1.5rem;
            color: #b8c6db;
            background: rgba(0,184,255,0.07);
            font-style: italic;
          }
          .entangle-post-content :global(img) {
            max-width: 100%;
            border-radius: 12px;
            margin: 1.5rem 0;
            box-shadow: 0 2px 12px #00B8FF22;
          }
          .entangle-post-content :global(h1),
          .entangle-post-content :global(h2),
          .entangle-post-content :global(h3),
          .entangle-post-content :global(h4),
          .entangle-post-content :global(h5),
          .entangle-post-content :global(h6) {
            color: #fff;
            margin: 2rem 0 1rem 0;
            line-height: 1.3;
          }
          .entangle-post-content :global(ul),
          .entangle-post-content :global(ol) {
            margin: 1rem 0;
            padding-left: 2rem;
          }
          .entangle-post-content :global(li) {
            margin: 0.5rem 0;
          }
          .entangle-post-content :global(a) {
            color: #00B8FF;
            text-decoration: underline;
            text-underline-offset: 2px;
          }
          .entangle-post-content :global(a:hover),
          .entangle-post-content :global(a:focus) {
            color: #6E00FF;
            outline: 2px solid #6E00FF;
            outline-offset: 2px;
          }
          .entangle-post-content :global(code) {
            background: rgba(0,184,255,0.1);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
          }
          .entangle-post-content :global(pre) {
            background: rgba(5, 5, 32, 0.9);
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            border: 1px solid rgba(110, 0, 255, 0.2);
          }
          .entangle-post-content :global(pre code) {
            background: none;
            padding: 0;
          }
          @media (max-width: 600px) {
            .entangle-post-title { font-size: 1.5rem; }
            .entangle-post-hero-content { padding: 1.2rem 0.5rem; }
            .entangle-post-content { padding: 1.2rem 0.7rem; }
            .entangle-post-actions { gap: 1rem; }
          }
          @media (prefers-reduced-motion: reduce) {
            .entangle-post-actions a,
            .entangle-post-actions button {
              transition: none;
            }
            .entangle-post-actions a:hover,
            .entangle-post-actions button:hover {
              transform: none;
            }
          }
        `}</style>
        
        <nav aria-label="Breadcrumb navigation">
          <Link href="/entanglement-log" className="entangle-back-link">
            <i className="fas fa-arrow-left" aria-hidden="true"></i> Back to Entanglement Log
          </Link>
        </nav>
        
        <article>
          <header className="entangle-post-hero">
            <div className="entangle-post-hero-content">
              <h1 className="entangle-post-title">{frontmatter.title}</h1>
              <div className="entangle-post-meta">
                By {frontmatter.author} · {formatDate(frontmatter.date)} · <span>{frontmatter.category}</span>
              </div>
              <div className="entangle-post-actions" role="toolbar" aria-label="Article actions">
                <a href="#" onClick={(e) => { e.preventDefault(); window.print(); }} aria-label="Print this article">
                  <i className="fas fa-print" aria-hidden="true"></i>
                </a>
                <button onClick={handleCopyLink} aria-label="Copy link to this article">
                  <i className="fas fa-link" aria-hidden="true"></i>
                </button>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=https://quannex.earth/entanglement-log/${slug}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                  <i className="fab fa-linkedin" aria-hidden="true"></i>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=https://quannex.earth/entanglement-log/${slug}&text=${encodeURIComponent(frontmatter.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X (Twitter)">
                  <i className="fab fa-x-twitter" aria-hidden="true"></i>
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=https://quannex.earth/entanglement-log/${slug}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                  <i className="fab fa-facebook" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </header>
          
          <section className="entangle-post-content" aria-label="Blog post content">
            <MDXRemote {...mdxSource} />
          </section>
        </article>
      </main>
    </>
  );
} 