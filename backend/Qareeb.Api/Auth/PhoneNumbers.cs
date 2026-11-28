using PhoneNumbers;

namespace Qareeb.Api.Auth;

public static class Phones
{
    public static string Normalize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input) || input.Length > 64 || !input.TrimStart().StartsWith('+'))
            throw new AuthFailure("Use an international phone number starting with + and country code.");
        try
        {
            var util = PhoneNumberUtil.GetInstance();
            var number = util.Parse(input, null);
            if (!util.IsValidNumber(number) || number.HasExtension) throw new AuthFailure("Invalid phone number.");
            return util.Format(number, PhoneNumberFormat.E164);
        }
        catch (NumberParseException) { throw new AuthFailure("Invalid phone number."); }
    }
}

public class AuthFailure(string message, int status = 400) : Exception(message)
{
    public int Status { get; } = status;
}
