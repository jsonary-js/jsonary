publicApi.UriTemplate = UriTemplate;

// Puts it in "exports" if it exists, otherwise create this.Jsonary (this == window, probably)
})((typeof module !== 'undefined' && module.exports) ? exports : (this.Jsonary = {}, this.Jsonary));
