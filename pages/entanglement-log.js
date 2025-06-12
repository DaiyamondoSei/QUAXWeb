import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Head from 'next/head';

export async function getStaticProps() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDirectory);
  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    return {
      slug: filename.replace(/\.md$/, ''),
      ...data,
      date: data.date ? String(data.date) : '',
    };
  });
  // Sort by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return { props: { posts } };
}

export default function EntanglementLog({ posts }) {
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
        <title>Entanglement Log | QUANNEX Blog</title>
        <meta name="description" content="Explore the Entanglement Log: Quantum-inspired articles, insights, and updates from the QUANNEX community." />
        <meta name="theme-color" content="#050520" />
        <meta property="og:title" content="Entanglement Log | QUANNEX Blog" />
        <meta property="og:description" content="Explore the Entanglement Log: Quantum-inspired articles, insights, and updates from the QUANNEX community." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://quannex.earth/entanglement-log" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Entanglement Log | QUANNEX Blog" />
        <meta name="twitter:description" content="Explore the Entanglement Log: Quantum-inspired articles, insights, and updates from the QUANNEX community." />
        <link rel="canonical" href="https://quannex.earth/entanglement-log" />
        <link rel="stylesheet" href="/styles/styles.css" />
        <link rel="stylesheet" href="/styles/footer.css" />
        <link rel="stylesheet" href="/styles/dropdown.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        <link rel="stylesheet" href="/styles/responsive.css" />
      </Head>
      
      <main style={{ minHeight: '100vh', background: '#050520', paddingTop: '7rem' }} role="main">
        <style jsx>{`
          .entangle-hero {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 6rem 1rem 3rem 1rem;
            background: linear-gradient(120deg, #050520 60%, #6E00FF 100%);
            position: relative;
            overflow: hidden;
          }
          .entangle-hero::before {
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
          .entangle-hero-content {
            position: relative;
            z-index: 2;
            padding: 2.5rem 2rem;
            border-radius: 24px;
            background: rgba(5, 5, 32, 0.25);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(110, 0, 255, 0.15);
            box-shadow: 0 8px 32px 0 rgba(0,0,0,0.18), 0 0 40px #6E00FF22, inset 0 0 20px #00B8FF11;
            text-align: center;
          }
          .entangle-hero-title {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(90deg, #6E00FF 0%, #00B8FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
            line-height: 1.2;
          }
          .entangle-hero-desc {
            font-size: 1.25rem;
            color: #c7eaff;
            margin-bottom: 1.5rem;
            line-height: 1.5;
          }
          .entangle-blog-list {
            max-width: 900px;
            margin: 0 auto 3rem auto;
            padding: 2rem 1rem 0 1rem;
            display: flex;
            flex-direction: column;
            gap: 2.5rem;
          }
          .entangle-blog-card {
            background: rgba(5, 5, 32, 0.85);
            border-radius: 20px;
            box-shadow: 0 2px 16px 0 #6E00FF22, 0 1.5px 8px 0 #00B8FF11;
            border: 1px solid rgba(110, 0, 255, 0.10);
            padding: 2rem 2rem 1.5rem 2rem;
            position: relative;
            transition: box-shadow 0.2s, transform 0.2s;
          }
          .entangle-blog-card:hover,
          .entangle-blog-card:focus-within {
            box-shadow: 0 8px 32px 0 #6E00FF33, 0 2px 12px 0 #00B8FF22;
            transform: translateY(-4px) scale(1.01);
            outline: 2px solid #00B8FF;
            outline-offset: 4px;
          }
          .entangle-blog-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #fff;
            line-height: 1.3;
          }
          .entangle-blog-title a {
            color: #fff;
            text-decoration: none;
            transition: color 0.2s;
            display: block;
            padding: 0.5rem 0;
            border-radius: 8px;
          }
          .entangle-blog-title a:hover,
          .entangle-blog-title a:focus {
            color: #00B8FF;
            outline: 2px solid #00B8FF;
            outline-offset: 4px;
          }
          .entangle-blog-meta {
            font-size: 0.95rem;
            color: #8ad6ff;
            margin-bottom: 1rem;
          }
          .entangle-blog-excerpt {
            font-size: 1.15rem;
            color: #e0eaff;
            margin-bottom: 1.25rem;
            line-height: 1.6;
          }
          .entangle-social {
            display: flex;
            gap: 1.2rem;
            align-items: center;
          }
          .entangle-social a {
            color: #00B8FF;
            font-size: 1.35rem;
            transition: color 0.2s, transform 0.2s;
            padding: 0.5rem;
            border-radius: 8px;
            min-height: 44px;
            min-width: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .entangle-social a:hover,
          .entangle-social a:focus {
            color: #6E00FF;
            transform: scale(1.18);
            outline: 2px solid #6E00FF;
            outline-offset: 2px;
          }
          .no-posts {
            text-align: center;
            color: #8ad6ff;
            font-size: 1.2rem;
            padding: 3rem 1rem;
            background: rgba(5, 5, 32, 0.5);
            border-radius: 20px;
            border: 1px solid rgba(110, 0, 255, 0.1);
          }
          .posts-count {
            text-align: center;
            color: #8ad6ff;
            font-size: 1rem;
            margin-bottom: 2rem;
            padding: 1rem;
            background: rgba(5, 5, 32, 0.3);
            border-radius: 12px;
            border: 1px solid rgba(110, 0, 255, 0.05);
          }
          @media (max-width: 600px) {
            .entangle-hero-title { font-size: 2rem; }
            .entangle-hero-content { padding: 1.2rem 0.5rem; }
            .entangle-blog-card { padding: 1.2rem 0.7rem; }
            .entangle-blog-title { font-size: 1.5rem; }
            .entangle-social { gap: 0.8rem; }
            .entangle-social a { 
              font-size: 1.2rem;
              padding: 0.4rem;
              min-height: 40px;
              min-width: 40px;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .entangle-blog-card,
            .entangle-social a {
              transition: none;
            }
            .entangle-blog-card:hover,
            .entangle-blog-card:focus-within {
              transform: none;
            }
            .entangle-social a:hover,
            .entangle-social a:focus {
              transform: none;
            }
          }
        `}</style>
        
        <header className="entangle-hero">
          <div className="entangle-hero-content">
            <h1 className="entangle-hero-title">Entanglement Log</h1>
            <p className="entangle-hero-desc">Welcome to the QUANNEX community blog. Explore quantum insights, consciousness research, and community updates. Share your favorite articles and join the conversation!</p>
          </div>
        </header>
        
        <section className="entangle-blog-list" aria-label="Blog posts">
          {posts.length > 0 && (
            <div className="posts-count" role="status" aria-live="polite">
              {posts.length} article{posts.length !== 1 ? 's' : ''} available
            </div>
          )}
          
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <article className="entangle-blog-card" key={post.slug}>
                <h2 className="entangle-blog-title">
                  <Link href={`/entanglement-log/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                <div className="entangle-blog-meta">
                  By {post.author} · {formatDate(post.date)} · <span>{post.category}</span>
                </div>
                <div className="entangle-blog-excerpt">{post.excerpt}</div>
                <div className="entangle-social" aria-label={`Share ${post.title}`}>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=https://quannex.earth/entanglement-log/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Share ${post.title} on LinkedIn`}>
                    <i className="fab fa-linkedin" aria-hidden="true"></i>
                  </a>
                  <a href={`https://twitter.com/intent/tweet?url=https://quannex.earth/entanglement-log/${post.slug}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" aria-label={`Share ${post.title} on X (Twitter)`}>
                    <i className="fab fa-x-twitter" aria-hidden="true"></i>
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=https://quannex.earth/entanglement-log/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Share ${post.title} on Facebook`}>
                    <i className="fab fa-facebook" aria-hidden="true"></i>
                  </a>
                </div>
              </article>
            ))
          ) : (
            <div className="no-posts">
              <p>No blog posts available yet. Check back soon for quantum insights and community updates!</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
} 