---
title: "RocketPhone Case Study: Launching an Enterprise MVNO with Spenza"
date: 2026-07-17T11:01:07
image: "/wp-content/uploads/2026/07/RocketPhone-Case-Study-Launching-an-AI-Powered-Business-Mobile-Network-with-Spenza.png"
category: "Spenza Platform"
---


<p class="wp-block-paragraph"><a href="https://rocketphone.ai/" target="_blank" rel="noreferrer noopener">RocketPhone.ai </a>turns customer conversations into structured Salesforce data. It had that working for softphone calls, video meetings and in-person meetings. Mobile calls stayed dark, because a call placed from a rep&#8217;s handset never touches RocketPhone&#8217;s infrastructure.</p>



<p class="wp-block-paragraph">Every workaround fails for the same reason. Recording a native cellular call requires control of the voice path, and the voice path belongs to the mobile operator. RocketPhone had to become one.</p>



<p class="wp-block-paragraph">Rather than spend on telecom infrastructure, <strong>RocketPhone<code> </code></strong><code>engage</code>d&nbsp;Spenza as its <a href="https://spenza.com/mvne/" target="_blank" rel="noreferrer noopener">MVNE</a>. <strong>Spenza </strong>supplied carrier integration, eSIM provisioning, rating, billing, subscriber management and multi-tier reseller control, exposed through APIs. RocketPhone kept its engineering on conversation AI.</p>



<p class="wp-block-paragraph">The mechanism that makes it work: Spenza terminates calls on RocketPhone&#8217;s provisioned numbers to a SIP URI. The rep places an ordinary cellular call with no app and no data connection. The far leg lands inside RocketPhone&#8217;s platform, where it gets recorded, transcribed and written to Salesforce.</p>



<h2 class="wp-block-heading"><strong>Customer overview</strong></h2>



<p><style>
  .table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .table-scroll::-webkit-scrollbar {
    height: 8px;
  }

  .table-scroll::-webkit-scrollbar-track {
    background: #f3f3f3;
    border-radius: 20px;
  }

  .table-scroll::-webkit-scrollbar-thumb {
    background: #cfcfcf;
    border-radius: 20px;
  }

  .table-scroll::-webkit-scrollbar-thumb:hover {
    background: #b5b5b5;
  }

  .responsive-table {
    width: 100%;
    min-width: 700px;
    table-layout: fixed;
    border-collapse: collapse;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  .responsive-table thead {
    background: #FCEAD7;
  }

  .responsive-table th,
  .responsive-table td {
    padding: 11px 13px;
    text-align: left;
    vertical-align: top;
    font-size: 14px;
    line-height: 1.5;
    color: #111;
    border-bottom: 1px solid #eee;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .responsive-table th {
    font-weight: 600;
    white-space: nowrap;
  }

  /* Column widths */
  .responsive-table th:nth-child(1),
  .responsive-table td:nth-child(1) {
    width: 30%;
  }

  .responsive-table th:nth-child(2),
  .responsive-table td:nth-child(2) {
    width: 70%;
  }

  /* Vertical borders */
  .responsive-table th:not(:last-child),
  .responsive-table td:not(:last-child) {
    border-right: 1px solid #eee;
  }

  /* Zebra rows */
  .responsive-table tbody tr:nth-child(even) {
    background: #f9f9f9;
  }

  /* Hover */
  .responsive-table tbody tr:hover {
    background: #fde7cc;
  }
</style></p>
<div class="table-scroll">
<table class="responsive-table">
<thead>
<tr>
<th>Field</th>
<th>Details</th>
</tr>
</thead>
<tbody>
<tr>
<td>Company</td>
<td>RocketPhone.ai Limited</td>
</tr>
<tr>
<td>Headquarters</td>
<td>London, United Kingdom</td>
</tr>
<tr>
<td>Category</td>
<td>Conversation intelligence for Salesforce</td>
</tr>
<tr>
<td>Products</td>
<td>RocketPhone Dialer, RocketVideo, RocketCell, and Vulnerability Detection</td>
</tr>
<tr>
<td>Salesforce Status</td>
<td>Certified ISV and listed on AppExchange</td>
</tr>
</tbody>
</table>
</div>



<p class="wp-block-paragraph">RocketPhone sells one idea: Salesforce is only as useful as the data inside it, and the richest customer data is spoken out loud, then lost. Its platform captures conversations across channels and writes back transcripts, summaries, sentiment, topics, action items and deal signals as structured records.</p>



<p class="wp-block-paragraph">Its own customers describe the value in those terms. Sam Wilson, CTO at Bruntwood, says on RocketPhone&#8217;s site that buyers are &#8220;not replacing like for like on telephony&#8221;, and frames the purchase as access to business process data the company did not previously hold.</p>



<h2 class="wp-block-heading"><strong>The Business Problem: Mobile Calls Were a Hole in the Data Model</strong></h2>



<p class="wp-block-paragraph">RocketPhone&#8217;s thesis carries a dependency. Capture has to be total. Suppose a CRM logs most of a company&#8217;s customer conversations but misses the rest. That does not leave you with most of the insight. It leaves you with a forecast built on a biased sample, because the calls that go unlogged are not a random subset. They are the ones made by field staff, at customer sites, in car parks, on the move. Those are the conversations where deals turn.</p>



<p class="wp-block-paragraph">RocketPhone had solved capture for every channel it controlled. Softphone calls ran through its dialer. Video ran through RocketVideo. In-person meetings had a capture path. Mobile calls, placed from a handset over the cellular network, went nowhere near any of it.</p>



<p class="wp-block-paragraph">Three obvious fixes exist. Each one breaks.</p>



<ol class="wp-block-list">
<li><strong>Ask reps to use a VoIP app.</strong>&nbsp;RocketPhone rejected this publicly, and its reasoning sits on rocketcell.ai: VoIP calls depend on data connectivity, which RocketPhone describes as unreliable in the field. A rep standing in a warehouse with one bar will not open an app to make a call. They will use the dialer on their phone. Any capture strategy that depends on changing that behaviour fails on contact with a sales team.</li>



<li><strong>Use the carrier&#8217;s call recording.</strong>&nbsp;This makes the operator a dependency for a core product feature. Recording quality, retention, API access and portability all sit with the MNO. Change operator and the integration is rebuilt. Serve a customer in a market where the operator offers nothing and the feature does not exist.</li>



<li><strong>Record on the handset.</strong>&nbsp;Mobile operating systems do not expose the native call audio path to third-party applications.&nbsp;</li>
</ol>



<div style="background-color: #fff4e5; border-left: 5px solid #FF9800; padding: 1.4em 1.6em; margin: 2em 0; border-radius: 6px; font-family: Arial, sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
<div style="color: #ff9800; font-size: 1.05em; font-weight: bold; margin-bottom: 0.9em;">The Constraint</div>
<p style="margin: 0; line-height: 1.6;">Every failed approach runs into the same fundamental limitation: <span style="font-weight: bold;">recording a native cellular call requires control of the voice path</span>. That voice path is controlled by the <span style="font-weight: bold;">mobile network operator</span>, not by the application running on the device. <br /><br />For <span style="font-weight: bold;">RocketPhone</span>, the objective was not to operate a mobile network. The goal was to capture <span style="font-weight: bold;">native mobile calls directly in Salesforce</span>. Achieving that required carrier-level control of the call flow, making operator capabilities the only practical path to delivering the desired experience.</p>
</div>



<h2 class="wp-block-heading"><strong>The Challenge</strong></h2>



<p class="wp-block-paragraph"><strong>RocketPhone </strong>wanted more than another mobile reseller program.</p>



<p class="wp-block-paragraph">The goal was to create a fully branded business mobile network that integrated directly with its UCaaS platform and Salesforce ecosystem while giving customers a seamless mobile experience.</p>



<p class="wp-block-paragraph">To make that possible, RocketPhone needed a platform that could:</p>



<ul class="wp-block-list">
<li>Launch branded SIM and eSIM services</li>



<li>Support native voice, SMS, and data connectivity</li>



<li>Integrate mobile services with its CRM and UCaaS platform</li>



<li>Enable enterprise customers and channel partners through a multi-tier distribution model</li>



<li>Automate provisioning, billing, subscription management, and ongoing operations</li>



<li>Scale internationally without building telecom infrastructure from scratch</li>
</ul>



<p class="wp-block-paragraph">Managing multiple carrier relationships, billing systems, provisioning platforms, and operational workflows internally would have significantly increased time to market.</p>



<h2 class="wp-block-heading"><strong>The Solution</strong></h2>



<figure class="wp-block-image aligncenter size-full is-resized"><img loading="lazy" decoding="async" width="2000" height="867" src="/wp-content/uploads/2026/07/rocketcell-call-flow.png" alt="" class="wp-image-21065" style="width:777px" srcset="/wp-content/uploads/2026/07/rocketcell-call-flow.png 2000w, /wp-content/uploads/2026/07/rocketcell-call-flow-300x130.png 300w, /wp-content/uploads/2026/07/rocketcell-call-flow-1024x444.png 1024w, /wp-content/uploads/2026/07/rocketcell-call-flow-768x333.png 768w, /wp-content/uploads/2026/07/rocketcell-call-flow-1536x666.png 1536w" sizes="(max-width: 2000px) 100vw, 2000px" /></figure>



<p class="wp-block-paragraph"><strong>Spenza </strong>delivered a complete MVNE platform that enabled RocketPhone to launch its branded mobile service on top of a carrier-agnostic connectivity platform.</p>



<p class="wp-block-paragraph">The implementation included:</p>



<ul class="wp-block-list">
<li>White label RocketPhone portal for administrators, partners, and enterprise customers</li>



<li>SIM and eSIM provisioning with API-based activation</li>



<li>Native voice, SMS, and mobile data connectivity</li>



<li>Multi-tier reseller and enterprise account management</li>



<li>Automated billing and subscription management</li>



<li>Marketplace access to mobile connectivity plans</li>



<li>APIs for integrating mobile services directly into RocketPhone&#8217;s applications and CRM</li>



<li>SIP routing support for enterprise voice workflows</li>



<li>Mobile messaging APIs for inbound and outbound SMS</li>



<li>Real-time dashboards for subscriptions, usage, revenue, and operational visibility</li>
</ul>



<p class="wp-block-paragraph">These capabilities matched the deployment plan outlined during the project and allowed RocketPhone to launch a unified connectivity experience alongside its existing communications platform.</p>



<h2 class="wp-block-heading"><strong>Implementation</strong></h2>



<p class="wp-block-paragraph">The deployment followed a structured rollout that included platform configuration, carrier integration where required, onboarding, testing, and production readiness.</p>



<p class="wp-block-paragraph">Working closely with the RocketPhone team, Spenza configured the platform, integrated the required connectivity services, enabled enterprise onboarding workflows, and prepared the environment for launch.</p>



<figure class="wp-block-image aligncenter size-full is-resized"><img loading="lazy" decoding="async" width="2000" height="933" src="/wp-content/uploads/2026/07/spenza-multitier-architecture.png" alt="" class="wp-image-21066" style="width:777px" srcset="/wp-content/uploads/2026/07/spenza-multitier-architecture.png 2000w, /wp-content/uploads/2026/07/spenza-multitier-architecture-300x140.png 300w, /wp-content/uploads/2026/07/spenza-multitier-architecture-1024x478.png 1024w, /wp-content/uploads/2026/07/spenza-multitier-architecture-768x358.png 768w, /wp-content/uploads/2026/07/spenza-multitier-architecture-1536x717.png 1536w" sizes="(max-width: 2000px) 100vw, 2000px" /></figure>



<h2 class="wp-block-heading"><strong>Results</strong></h2>



<p class="wp-block-paragraph">With Spenza, RocketPhone successfully launched a branded business mobile offering without building its own telecom stack.</p>



<p class="wp-block-paragraph">RocketPhone gained:</p>



<ul class="wp-block-list">
<li>A fully branded mobile connectivity platform</li>



<li>Integrated eSIM, voice, SMS, and billing capabilities</li>



<li>Enterprise-ready APIs</li>



<li>Multi-tier reseller enablement</li>



<li>Automated provisioning and subscription lifecycle management</li>



<li>A scalable platform that supports future carrier expansion and additional markets</li>
</ul>



<p class="wp-block-paragraph">The result is a unified platform where business mobile connectivity becomes a natural extension of RocketPhone&#8217;s AI-powered communications offering instead of a separate product.</p>



<h2 class="wp-block-heading"><strong>What Scaling Looks Like Next</strong></h2>



<p class="wp-block-paragraph">The platform&#8217;s modular design is what the proposal offers for growth: add operators, launch in new markets, extend with add-ons. In practice that means a few concrete moves for RocketPhone.</p>



<p class="wp-block-paragraph"><strong>More markets.</strong>&nbsp;RocketCell is UK-based today. Spenza&#8217;s marketplace model means a new market is a commercial decision about which operator plan to resell, not an engineering project.</p>



<p class="wp-block-paragraph"><strong>Reseller depth.</strong>&nbsp;RocketPhone&#8217;s Salesforce SI partners are a natural reseller tier. The platform already supports their markup, branding and billing.</p>



<p class="wp-block-paragraph"><strong>Self-serve.</strong>&nbsp;The proposal scopes eCommerce provisioning and Shopify. A customer buying a line without talking to sales changes the unit economics of the whole motion.&nbsp;</p>



<p class="wp-block-paragraph"><strong>API access downstream.</strong>&nbsp;The proposal includes offering API access to RocketPhone&#8217;s own customers, which turns the connectivity layer into something enterprises can automate against.</p>



<h2 class="wp-block-heading"><strong>Why It Matters</strong></h2>



<p class="wp-block-paragraph">Modern business communication extends beyond desk phones and video meetings. Mobile conversations are equally important, especially for sales teams, field employees, and customer-facing staff.</p>



<p class="wp-block-paragraph">By combining RocketPhone&#8217;s conversation intelligence platform with Spenza&#8217;s mobile connectivity infrastructure, enterprises can deliver business mobile services that integrate directly into their communication workflows while simplifying deployment, operations, and customer management.</p>



<p class="wp-block-paragraph">Instead of building telecom infrastructure, RocketPhone focused on delivering customer value while Spenza handled the complexity behind connectivity.</p>



<h2 class="wp-block-heading"><strong>About Spenza</strong></h2>



<p class="wp-block-paragraph">Spenza is a no-code MVNE platform that enables businesses to launch branded mobile services with APIs, eSIM provisioning, billing, compliance, reseller management, and access to a global connectivity marketplace. Companies use Spenza to launch and scale MVNOs, embedded connectivity offerings, and enterprise mobility solutions without the traditional complexity of telecom infrastructure.</p>



<h2 class="wp-block-heading"><strong>Key Takeaways</strong></h2>



<ol class="wp-block-list">
<li>Recording a native cellular call requires control of the voice path, and that means operating the network. There is no software shortcut.</li>



<li>Termination to a SIP URI is the mechanism: the user&#8217;s leg stays cellular, the far leg lands in your platform.</li>



<li>An MVNE removes the 12-to-15-month, multi-million-pound path to becoming an operator, which matters most when telecom is not what your customers buy.</li>



<li>Multi-tier reseller structure lets a connectivity layer inherit an existing partner motion rather than force a new one.</li>



<li>eSIM plus QR activation removes logistics from onboarding, which is where mobile rollouts usually stall.</li>
</ol>



<h2 class="wp-block-heading"><strong>Conclusion</strong></h2>



<p class="wp-block-paragraph">RocketPhone&#8217;s journey demonstrates that delivering enterprise-grade mobile communications is not about building telecom infrastructure. It is about enabling seamless customer experiences while keeping engineering efforts focused on the core product. By partnering with Spenza, RocketPhone launched a fully branded business mobile network with native voice, eSIM, automated provisioning, billing, and Salesforce integration without taking on the complexity of operating a mobile network.</p>



<p class="wp-block-paragraph">With a scalable MVNE platform handling carrier integrations and connectivity operations, RocketPhone can continue expanding into new markets, support more enterprise customers and partners, and evolve its AI-powered communications platform with confidence. The result is a unified solution where mobile connectivity becomes a natural extension of conversation intelligence rather than a separate product.</p>



<p class="wp-block-paragraph">If your business is looking to launch an enterprise MVNO, embed mobile connectivity into your platform, or build branded mobile services without investing in telecom infrastructure, Spenza provides the technology, APIs, and operational foundation to help you launch faster and scale with confidence. <a href="https://calendly.com/spenza/discovery" target="_blank" rel="noreferrer noopener">Book a demo</a> to see how Spenza can accelerate your connectivity journey.</p>



<div class="wp-block-uagb-buttons uagb-buttons__outer-wrap uagb-btn__default-btn uagb-btn-tablet__default-btn uagb-btn-mobile__default-btn uagb-block-68257511"><div class="uagb-buttons__wrap uagb-buttons-layout-wrap ">
<div class="wp-block-uagb-buttons-child uagb-buttons__outer-wrap uagb-block-74a16303 wp-block-button"><div class="uagb-button__wrapper"><a class="uagb-buttons-repeater wp-block-button__link" aria-label="" href="/contact-us/" rel="follow noopener" target="_blank" role="button"><div class="uagb-button__link">Contact Us Today</div></a></div></div>
</div></div>
