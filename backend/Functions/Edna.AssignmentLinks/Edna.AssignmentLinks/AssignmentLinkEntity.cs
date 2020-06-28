using Microsoft.WindowsAzure.Storage.Table;

namespace Edna.AssignmentLinks
{
    public class AssignmentLinkEntity : TableEntity
    {
        public string DisplayText { get; set; }
        public string Url { get; set; }
        public string Description { get; set; }
    }
}