# Cloudhook

Cloudhook is a service that enables webhook messages to be received behind firewalls or through proxies.

1. Run the Cloudhook client i.e.
   `cloudhook yourname/yourhook | jq | myscript.sh` and pipe the output in to whatever script or application you want.
2. Point a webhook at /hook/yourname/yourhook
3. Trigger the webhook.
4. The body of the message will be printed on stdout, and into whatever your pipe is pointing at. 

My favourite is powershell.

```powershell
(cloudhook-client "test/1") | % {
    $object = $_ | ConvertFrom-Json
    # Do Things!
    #   $object.key
    # More Hooks!
    #   Invoke-RestMethod -Method POST -Uri https://server -body $object
}
```

Anyone who knows (or guesses) your webhook can send things to your listener!<br>
I suggest picking something like:
```
yourname-acfe5234afe26afe7465afe845afe09af0/myhook-a9e8c7fb68ae7f6bc9ae8f76cb9ae87
```
or something similarly unguessable.
