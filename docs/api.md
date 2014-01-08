# Persistance & Query API

The library exposes a simple persistence API.

## Register Object Types

```
setType(type, fn) //register prototype
```

I'm considering releasing a library as a bower module. Are there issues with code quality, missing test cases, that need to be addressed first? Perhaps it's not a good candidate for public release. If so, why not?

What level of documentation would you want for something like this? I've seen some open source modules publish annotated source, in addition to API documentation. Is annotated source documentation overkill for something like this?

<table> 
<thead> 
<tr> 
    <th>Operation</th> 
    <th>Description</th> 
    <th>Example</th> 
</tr> 
</thead> 
<tbody> 
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.new</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.bulk_new</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.save</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.bulk_save</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.destroy</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.bulk_destroy</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.exists?</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.find</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.find_by</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.find_or_save_by</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.first</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.first_or_save</code></pre></td>
</tr>
<tr>
    <td></td> 
    <td></td> 
    <td><pre><code>db.last</code></pre></td>
</tr>
</tbody> 
</table>

